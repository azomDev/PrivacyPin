import { Database } from "bun:sqlite";
import { User, Ping, WithoutId, FrontendLink, mapLinkToFrontendLink, Link } from "./models";

const db = new Database("database.sqlite")
db.query(
    `CREATE TABLE 
    IF NOT EXISTS positions 
    (id TEXT, user_id TEXT, longitude DECIMAL, latitude DECIMAL, timestamp INTEGER)`
).run();
db.query(
    `CREATE TABLE 
    IF NOT EXISTS users 
    (id TEXT, username TEXT)`
).run();
db.query(
    `CREATE TABLE
    IF NOT EXISTS links
    (id TEXT, user_id_1 TEXT, user_id_2 TEXT, is_user_1_sending INTEGER, is_user_2_sending INTEGER)`
).run();

export class ServerDatabase {
    static getAllUsers(): User[] {
        const select_query = db.prepare(`SELECT * FROM users`);
        return select_query.all() as User[];
    }

    static createUser(user: WithoutId<User>): string {
        let id = crypto.randomUUID();

        const insert_query = db.prepare(
            `INSERT INTO users 
            (id, username) 
            VALUES 
            ($id, $username)`
        );

        insert_query.run({ $id: id, $username: user.username });
        return id;
    }

    static insertPing(ping: WithoutId<Ping>) {
        let id = crypto.randomUUID();

        const delete_query = db.prepare(
            `DELETE FROM positions 
            WHERE user_id = $ping.user_id`
        );
        delete_query.run({ $user_id: ping.user_id });

        const insert_query = db.prepare(
            `INSERT INTO positions 
            (id, user_id, longitude, latitude, timestamp) 
            VALUES 
            ($id, $ping.user_id, $ping.longitude, $ping.latitude, $ping.timestamp)`
        );
        insert_query.run({ $id: id, $user_id: ping.user_id, $longitude: ping.longitude, $latitude: ping.latitude, $timestamp: ping.timestamp });
    }

    static getPing(user_id: string): Ping {
        const select_query = db.prepare(
            `SELECT * 
            FROM positions 
            WHERE user_id = $user_id`
        );
        return select_query.get({ $user_id: user_id }) as Ping;
    }

    static getLinks(my_user_id: string): FrontendLink[] {
        const select_query = db.prepare(
            `SELECT *
            FROM links
            WHERE $user_id IN (user_id_1, user_id_2)`
        );
        const links: Link[] = select_query.all({ $user_id: my_user_id}) as Link[];
        return links.map((dbRow) => mapLinkToFrontendLink(dbRow, my_user_id)) as FrontendLink[];
    }

    static modifyLink(sender_user_id: string, receiver_user_id: string, new_value: number) {
        const updateQuery = db.prepare(
            `UPDATE links
            SET
                is_user_1_sending = CASE WHEN user_id_1 = $user_id_1 AND user_id_2 = $user_id_2 THEN $new_value ELSE is_user_1_sending END,
                is_user_2_sending = CASE WHEN user_id_1 = $user_id_2 AND user_id_2 = $user_id_1 THEN $new_value ELSE is_user_2_sending END
            WHERE (user_id_1 = $user_id_1 AND user_id_2 = $user_id_2) 
                OR (user_id_1 = $user_id_2 AND user_id_2 = $user_id_1)`
        );
        updateQuery.run({$user_id_1: sender_user_id, $user_id_2: receiver_user_id, $new_value: new_value});
    }

    static createLink(sender_user_id: string, receiver_user_id: string): FrontendLink {
        const select_query = db.prepare(
            `SELECT id, user_id_1, user_id_2 
            FROM links 
            WHERE (user_id_1 = $user_id_1 AND user_id_2 = $user_id_2) 
            OR (user_id_1 = $user_id_2 AND user_id_2 = $user_id_1)`
        );
        const link: Link = select_query.get({$user_id_1: sender_user_id, $user_id_2: receiver_user_id}) as Link;
        if (link == null) {
            let id = crypto.randomUUID();
            const insertQuery = db.prepare(
                `INSERT INTO links (id, user_id_1, user_id_2, is_user_1_sending, is_user_2_sending)
                VALUES ($id, $user_id_1, $user_id_2, 1, NULL)`
            );
            insertQuery.run({$id: id, $user_id_1: sender_user_id, $user_id_2: receiver_user_id})
            return {id: id, receiver_user_id: receiver_user_id, am_i_sending: 1};
        }
        else {
            const updateQuery = db.prepare(
                `UPDATE links
                SET
                    is_user_1_sending = CASE WHEN user_id_1 = $user_id_1 AND user_id_2 = $user_id_2 THEN 1 ELSE is_user_1_sending END,
                    is_user_2_sending = CASE WHEN user_id_1 = $user_id_2 AND user_id_2 = $user_id_1 THEN 1 ELSE is_user_2_sending END
                WHERE id = $link_id`
            );
            updateQuery.run({$link_id: link.id, $user_id_1: sender_user_id, $user_id_2: receiver_user_id})
            return {id: link.id, receiver_user_id: receiver_user_id, am_i_sending: 1};
        }
    }
}
