import { Database } from "bun:sqlite";
import { Ping, redColor, resetColor } from "./utils";

const db = new Database("database.sqlite");
db.prepare(
    `CREATE TABLE 
    IF NOT EXISTS positions 
    (sender_user_id TEXT, receiver_user_id TEXT, encrypted_ping TEXT, timestamp TEXT)`
).run();
db.prepare(
    `CREATE TABLE 
    IF NOT EXISTS users 
    (user_id TEXT, public_signing_key TEXT)`
).run();
db.prepare(
    // if the registration key is null, it's to store the last timestamp of registration key generation
    `CREATE TABLE 
    IF NOT EXISTS registration_keys
    (registration_key TEXT, timestamp TEXT)`
).run();

const admin_user_entry = db.prepare(`SELECT * FROM users WHERE user_id = 'ADMIN'`).get();

if (!admin_user_entry) {
    console.log(`${redColor}Add some logs for the first setup of the server${resetColor}`);
    const admin_registration_key = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    db.prepare(`INSERT INTO registration_keys (registration_key, timestamp) VALUES ($registration_key, $timestamp)`).run({
        $registration_key: admin_registration_key,
        $timestamp: timestamp,
    });
    console.log(`${redColor}Admin registration key: ${admin_registration_key}${resetColor}`);
    db.prepare(`INSERT INTO registration_keys (registration_key, timestamp) VALUES (NULL, ?)`).run(timestamp);
    db.prepare(`INSERT INTO users (user_id, public_signing_key) VALUES ('ADMIN', NULL)`).run();
}

export class ServerDatabase {
    static createUser(public_signing_key: string): { user_id: string; is_admin: boolean } {
        let user_id = crypto.randomUUID();
        let is_admin = false;

        const admin_user_entry = db.prepare(`SELECT public_signing_key FROM users WHERE user_id = 'ADMIN'`).get() as {
            public_signing_key: String;
        };

        if (!admin_user_entry.public_signing_key) {
            is_admin = true;
            db.prepare(`UPDATE users SET public_signing_key = $public_signing_key WHERE user_id = 'ADMIN'`).run({ $public_signing_key: public_signing_key });
        }

        db.prepare(
            `INSERT INTO users 
            (user_id, public_signing_key) 
            VALUES ($user_id, $public_signing_key)`
        ).run({ $user_id: user_id, $public_signing_key: public_signing_key });
        return { user_id: user_id, is_admin: is_admin };
    }

    static updatePing(ping: Ping) {
        db.prepare(
            `DELETE FROM positions 
            WHERE sender_user_id = $sender_user_id AND receiver_user_id = $receiver_user_id`
        ).run({ $sender_user_id: ping.sender_user_id, $receiver_user_id: ping.receiver_user_id });

        db.prepare(
            `INSERT INTO positions 
            (sender_user_id, receiver_user_id, encrypted_ping, timestamp) 
            VALUES ($sender_user_id, $receiver_user_id, $encrypted_ping, $timestamp)`
        ).run({
            $sender_user_id: ping.sender_user_id,
            $receiver_user_id: ping.receiver_user_id,
            $encrypted_ping: ping.encrypted_ping,
            $timestamp: ping.timestamp,
        });
    }

    static getPing(sender_user_id: string, receiver_user_id: string): Ping | null {
        const ping: Ping | null = db
            .prepare(
                `SELECT * 
            FROM positions 
            WHERE sender_user_id = $sender_user_id AND receiver_user_id = $receiver_user_id`
            )
            .get({ $sender_user_id: sender_user_id, $receiver_user_id: receiver_user_id }) as Ping | null;

        if (ping === null) {
            return null;
        }
        return { sender_user_id: sender_user_id, receiver_user_id: receiver_user_id, encrypted_ping: ping.encrypted_ping, timestamp: ping.timestamp };
    }

    static generateRegistrationKey(timestamp: string): string {
        let registration_key = crypto.randomUUID();
        db.prepare(
            `INSERT INTO registration_keys 
            (registration_key, timestamp) 
            VALUES ($registration_key, $timestamp)`
        ).run({ $registration_key: registration_key, $timestamp: timestamp });

        db.prepare(
            `UPDATE registration_keys 
            SET timestamp = $timestamp 
            WHERE registration_key IS NULL`
        ).run({ $timestamp: timestamp });

        return registration_key;
    }

    static getPublicSigningKey(user_id: string): string {
        const result: string = db
            .prepare(
                `SELECT public_signing_key 
            FROM users 
            WHERE user_id = $user_id`
            )
            .get({ $user_id: user_id }) as string;

        return result;
    }

    static isRegistrationKeyValidAndDelete(registration_key: string): boolean {
        const result = db
            .prepare(
                `SELECT * 
            FROM registration_keys 
            WHERE registration_key = $registration_key`
            )
            .get({ $registration_key: registration_key });

        if (result) {
            db.prepare(
                `DELETE FROM registration_keys 
            WHERE registration_key = $registration_key`
            ).run({ $registration_key: registration_key });
            return true;
        }
        return false;
    }

    static isPingBeforeLastOne(ping: Ping): boolean {
        const last_timestamp: string | null = db
            .prepare(
                `SELECT timestamp 
            FROM positions 
            WHERE sender_user_id = $sender_user_id AND receiver_user_id = $receiver_user_id `
            )
            .get({ $sender_user_id: ping.sender_user_id, $receiver_user_id: ping.receiver_user_id }) as string | null;

        if (last_timestamp === null) {
            return true; // no ping has been sent yet, no risk of replay attack
        }
        return ping.timestamp >= last_timestamp;
    }

    static isNewAdminTimestampBeforeLastOne(new_timestamp: string): boolean {
        const last_admin_timestamp_entry: string = db
            .prepare(
                `SELECT timestamp 
            FROM registration_keys 
            WHERE registration_key IS NULL`
            )
            .get() as string;

        return new_timestamp < last_admin_timestamp_entry;
    }

    static nukeRegistrationKeys(timestamp: string) {
        db.prepare(`DELETE FROM registration_keys WHERE registration_key IS NOT NULL`).run();
        db.prepare(
            `UPDATE registration_keys 
            SET timestamp = $timestamp 
            WHERE registration_key IS NULL`
        ).run({ $timestamp: timestamp });
    }
}
