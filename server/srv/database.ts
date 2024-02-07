import { Database } from "bun:sqlite";
import { User, Ping, WithoutId, Link } from "./models";

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
        const query = db.prepare(`SELECT * FROM users`);
        return query.all() as User[];
    }

    static createUser(user: WithoutId<User>): User {
        let id = crypto.randomUUID();

        const query = db.prepare(
            `INSERT INTO users 
            (id, username) 
            VALUES 
            ($id, $user.username)`
        );

        query.run({ $id: id, $username: user.username });
        return { id: id, username: user.username};
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

        insert_query.run({ $id: id, $user_id: ping.user_id, $longitude: ping.longitude, $latitude: ping.latitude, $timestamp: ping.timestamp }); //! Make this shorter and all others by using list comphrehenion or smth
    }

    static getPing(user_id: string): Ping {
        const query = db.prepare(
            `SELECT * 
            FROM positions 
            WHERE user_id = $user.id`
        );

        return query.get({ $user_id: user_id }) as Ping;
    }

    static getFriends(my_user_id: string): Link[] {
        const query = db.prepare(
            `SELECT *
            FROM links
            WHERE $user_id IN (user_id_1, user_id_2)`
        );
        return query.all({ $user_id: my_user_id}) as Link[];
    }

    static modifyLink() {
    }

    static createFriendLink(sender_user_id: string, receiver_user_id: string) {
        const select_query = db.prepare(
            `SELECT id, user_id_1, user_id_2 
            FROM links 
            WHERE (user_id_1 = $user_id_1 AND user_id_2 = $user_id_2) 
            OR (user_id_1 = $user_id_2 AND user_id_2 = $user_id_1)`
        );
        const link: Link = select_query.get({$user_id_1: sender_user_id, $user_id_2: receiver_user_id}) as Link
        if (link == null) {
            let id = crypto.randomUUID();
            const insertQuery = db.prepare(
                `INSERT INTO links (id, user_id_1, user_id_2, is_user_1_sending, is_user_2_sending)
                VALUES ($id, $user_id_1, $user_id_2, 1, NULL)
                ON CONFLICT DO NOTHING`
            );
            insertQuery.run({$id: id, $user_id_1: sender_user_id, $user_id_2: receiver_user_id})
        }
        else {
            const updateQuery = db.prepare(
                `UPDATE links
                SET
                    is_user_1_sending = CASE WHEN user_id_1 = $user_id_1 AND user_id_2 = $user_id_2 THEN 1 ELSE is_user_1_sending END,
                    is_user_2_sending = CASE WHEN user_id_1 = $user_id_1 AND user_id_2 = $user_id_2 THEN NULL ELSE is_user_2_sending END
                WHERE id = $link_id`
            );
            updateQuery.run({$link_id: link.id})
        }
    }
}
