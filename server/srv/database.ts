import { Database } from "bun:sqlite";
import { User, Ping, WithoutId } from "./models";

const db = new Database("database.sqlite") //! THis might be better to do everything up here or something

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
        this.db
            .query(
                `CREATE TABLE
                IF NOT EXISTS links
                (id TEXT, sender_id TEXT, receiver_id TEXT, is_link_active INTEGER)`
            )
            .run();
    }

    static closeDatabase() {
        this.db.close(); // Idk mabye change it to the right notation if there is one
    }

    static getAllUsers(): User[] {
        const query = db.prepare(`SELECT * FROM users`);
        return query.all() as User[];
    }

    static createUser(user: WithoutId<User>): User {
        let id = crypto.randomUUID();

        const query = this.db.prepare(
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

        const deleteQuery = this.db.prepare(
            `DELETE FROM positions 
            WHERE user_id = $ping.user_id`
        );

        deleteQuery.run({ $user_id: ping.user_id });

        const insertQuery = this.db.prepare(
            `INSERT INTO positions 
            (id, user_id, longitude, latitude, timestamp) 
            VALUES 
            ($id, $ping.user_id, $ping.longitude, $ping.latitude, $ping.timestamp)`
        );

        insertQuery.run({ $id: id, $user_id: ping.user_id, $longitude: ping.longitude, $latitude: ping.latitude, $timestamp: ping.timestamp });
    }

    static getPing(user: User): Ping { //? Only need user id instead of the whole user object?
        if (user.id === undefined) throw new Error("Method getPing should receive a user with an id not undefined");

        const query = this.db.prepare(
            `SELECT * 
            FROM positions 
            WHERE user_id = $user.id`
        );

        return query.get({ $user_id: user.id }) as Ping;
    }

    // friends that can receive your location
    static getReceiverFriends(sender_user: User): User[] { //? Only need user id instead of the whole user object?

        const query = this.db.prepare(
            `SELECT *
            FROM links
            WHERE sender_id = $sender_id`
        )
        return query.all({ $sender_id: sender_user.id }) as User[];
    }

    // friends that can send their location to you
    static getSenderFriends(receiver_user: User): User[] { //? Only need user id instead of the whole user object?

        const query = this.db.prepare(
            `SELECT *
            FROM links
            WHERE receiver_id = $receiver_id`
        )
        return query.all({ $sender_id: receiver_user.id }) as User[];
    }

    static createFriendLink(sender_user: User, receiver_user: User) {
        let id = crypto.randomUUID();

        const query = this.db.prepare(
            `INSERT INTO links
            (id, sender_id, receiver_id)
            VALUES
            ($id, $sender_id, $receiver_id)`
        );
        query.run({$id: id, $sender_id: sender_user.id, $receiver_id: receiver_user.id});
    }
}
