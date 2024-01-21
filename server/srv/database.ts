import { Database } from "bun:sqlite";
import { Person, Ping } from "./models";

export class ServerDatabase {
    static db: Database;

    static openDatabase() {
        this.db = new Database("database.sqlite");
        this.db
            .query(
                `CREATE TABLE 
            IF NOT EXISTS positions 
            (id TEXT, user_id TEXT, longitude DECIMAL, latitude DECIMAL, timestamp INTEGER)`
            )
            .run();
        this.db
            .query(
                `CREATE TABLE 
            IF NOT EXISTS users 
            (id TEXT, username TEXT)`
            )
            .run();
        // this.db.query(
        //     `CREATE TABLE
        //     IF NOT EXISTS friend_requests
        //     (id TEXT, user_id TEXT, user_id_to_send_request TEXT)`
        // ).run();
        // this.db.query(
        //     `CREATE TABLE
        //     IF NOT EXISTS friend_links
        //     (id TEXT, user_id_1 TEXT, user_id_2 TEXT)`
        // ).run();
    }

    static closeDatabase() {
        this.db.close(); // Idk mabye change it to the right notation
    }

    static getAllUsers(): Person[] {
        const query = this.db.prepare(`SELECT * FROM users`);
        return query.all() as Person[];
    }

    static createUser(username: string): string {
        let id = crypto.randomUUID();

        const query = this.db.prepare(
            `INSERT INTO users 
            (id, username) 
            VALUES 
            ($id, $username)`
        );

        query.run({ $id: id, $username: username });
        return id;
    }

    static insertPing(user_id: string, longitude: number, latitude: number, timestamp: number): boolean {
        let id = crypto.randomUUID();

        const deleteQuery = this.db.prepare(
            `DELETE FROM positions 
            WHERE user_id = $user_id`
        );

        deleteQuery.run({ $user_id: user_id });

        const insertQuery = this.db.prepare(
            `INSERT INTO positions 
            (id, user_id, longitude, latitude, timestamp) 
            VALUES 
            ($id, $user_id, $longitude, $latitude, $timestamp)`
        );

        insertQuery.run({ $id: id, $user_id: user_id, $longitude: longitude, $latitude: latitude, $timestamp: timestamp });
        return true;
    }

    static getPing(user_id: string): Ping {
        const query = this.db.prepare(
            `SELECT * 
            FROM positions 
            WHERE user_id = $user_id`
        );

        return query.get({ $user_id: user_id }) as Ping;
    }

    // static getFriends(user_id_to_get_from: string): Person[] {
    //     throw new Error("Method not implemented."); // TODO
    // }

    // static createFriendLink(user_id_1: string, user_id_2: string) {
    //     let id = crypto.randomUUID().toString(); // is the .toString() needed?

    //     const query = this.db.prepare(
    //             `INSERT INTO friend_links
    //             (id, user_id_1, user_id_2)
    //         VALUES
    //         ($id, $user_id_1, $user_id_2)`
    //     );
    //     query.run({$id: id, $user_id_1: user_id_1, $user_id_2: user_id_2});
    // }

    // static deleteFriendRequest(user_id: string, user_id_to_send_request: string) {
    //     throw new Error("Method not implemented."); // TODO
    // }

    // static createFriendRequest(user_id: string, user_id_to_send_request: string) {
    //     let id = crypto.randomUUID().toString(); // is the .toString() needed?

    //     const query = this.db.prepare(
    //         `INSERT INTO friend_requests
    //         (id, user_id, user_id_to_send_request)
    //         VALUES
    //         ($id, $user_id, $user_id_to_send_request)`
    //     );

    //     query.run({$id: id, $user_id: user_id, $user_id_to_send_request: user_id_to_send_request});
    // }
}
