import { Database } from "bun:sqlite";
import { User, Ping, WithoutId, FrontendLink, mapLinkToFrontendLink, Link } from "./models";

const db = new Database("database.sqlite");
db.prepare(
    `CREATE TABLE 
    IF NOT EXISTS positions 
    (id TEXT, user_id TEXT, longitude DECIMAL, latitude DECIMAL, timestamp INTEGER)`
).run();
db.prepare(
    `CREATE TABLE 
    IF NOT EXISTS users 
    (id TEXT, username TEXT)`
).run();
db.prepare(
    `CREATE TABLE
    IF NOT EXISTS links
    (id TEXT, user_id_1 TEXT, user_id_2 TEXT, is_user_1_sending INTEGER, is_user_2_sending INTEGER)`
).run();

// db.prepare(
//     `CREATE TABLE
//     IF NOT EXISTS links
//     (id TEXT, user_id_1 TEXT, user_id_2 TEXT, is_user_1_sending INTEGER, is_user_2_sending INTEGER, user_1_encrypted_location_decryption_key BLOB, user_2_encrypted_location_decryption_key, BLOB)`
// ).run();

export class ServerDatabase {
    static getAllUsers(): User[] {
        const users: User[] = db.prepare(`SELECT * FROM users`).all() as User[];
        return users;
    }

    static createUser(user: WithoutId<User>): string {
        let id = crypto.randomUUID();

        db.prepare(
            `INSERT INTO users 
            (id, username) 
            VALUES 
            ($id, $username)`
        ).run({ $id: id, $username: user.username });
        return id;
    }

    static insertPing(ping: WithoutId<Ping>) {
        let id = crypto.randomUUID();

        db.prepare(
            `DELETE FROM positions 
            WHERE user_id = $user_id`
        ).run({ $user_id: ping.user_id });

        db.prepare(
            `INSERT INTO positions 
            (id, user_id, longitude, latitude, timestamp) 
            VALUES 
            ($id, $user_id, $longitude, $latitude, $timestamp)`
        ).run({ $id: id, $user_id: ping.user_id, $longitude: ping.longitude, $latitude: ping.latitude, $timestamp: ping.timestamp });
    }

    static getPing(user_id: string): Ping {
        const ping = db
            .prepare(
                `SELECT * 
            FROM positions 
            WHERE user_id = $user_id`
            )
            .get({ $user_id: user_id }) as Ping;
        return ping;
    }

    static getLinks(my_user_id: string): FrontendLink[] {
        const links = db
            .prepare(
                `SELECT *
            FROM links
            WHERE $user_id IN (user_id_1, user_id_2)`
            )
            .all({ $user_id: my_user_id }) as Link[];
        return links.map((dbRow) => mapLinkToFrontendLink(dbRow, my_user_id)) as FrontendLink[];
    }

    static modifyLink(sender_user_id: string, receiver_user_id: string, new_value: number) {
        db.prepare(
            `UPDATE links
            SET
                is_user_1_sending = CASE WHEN user_id_1 = $user_id_1 AND user_id_2 = $user_id_2 THEN $new_value ELSE is_user_1_sending END,
                is_user_2_sending = CASE WHEN user_id_1 = $user_id_2 AND user_id_2 = $user_id_1 THEN $new_value ELSE is_user_2_sending END
            WHERE (user_id_1 = $user_id_1 AND user_id_2 = $user_id_2) 
                OR (user_id_1 = $user_id_2 AND user_id_2 = $user_id_1)`
        ).run({ $user_id_1: sender_user_id, $user_id_2: receiver_user_id, $new_value: new_value });
    }

    static createLink(sender_user_id: string, receiver_user_id: string) {
        let id = crypto.randomUUID();
        db.prepare(
            `INSERT INTO links (id, user_id_1, user_id_2, is_user_1_sending, is_user_2_sending)
                VALUES ($id, $user_id_1, $user_id_2, 1, 0)`
        ).run({ $id: id, $user_id_1: sender_user_id, $user_id_2: receiver_user_id });
    }
}
