import { Database } from "bun:sqlite";
import { Ping, LocationKey } from "./models";

const db = new Database("database.sqlite");
db.prepare(
    `CREATE TABLE 
    IF NOT EXISTS positions 
    (user_id TEXT, encrypted_ping TEXT, timestamp TEXT)`
).run();
db.prepare(
    `CREATE TABLE 
    IF NOT EXISTS users 
    (user_id TEXT, public_signing_key TEXT)`
).run();
db.prepare( // if the registration key is null, it's to store the last timestamp of registration key generation
    `CREATE TABLE 
    IF NOT EXISTS registration_keys
    (registration_key TEXT, timestamp TEXT)`
).run();
db.prepare(
    `CREATE TABLE 
    IF NOT EXISTS location_keys 
    (sender_user_id TEXT, receiver_user_id TEXT, location_key TEXT, timestamp TEXT)`
).run();

const registrationKeyEntry = db.prepare(`SELECT * FROM registration_keys WHERE registration_key IS NULL`).get();

if (!registrationKeyEntry) {
    db.prepare(`INSERT INTO registration_keys (registration_key, timestamp) VALUES (NULL, ?)`).run(new Date().toISOString());
}

export class ServerDatabase {
    static createUser(public_signing_key: string): string {
        let id = crypto.randomUUID();

        db.prepare(
            `INSERT INTO users 
            (id, public_signing_key) 
            VALUES ($id, $public_signing_key)`
        ).run({ $id: id, $public_signing_key: public_signing_key });
        return id;
    }

    static updatePing(ping: Ping) {
        db.prepare(
            `DELETE FROM positions 
            WHERE user_id = $user_id`
        ).run({ $user_id: ping.user_id });

        db.prepare(
            `INSERT INTO positions 
            (user_id, encrypted_ping, timestamp) 
            VALUES ($user_id, $encrypted_ping, $timestamp)`
        ).run({$user_id: ping.user_id, $encrypted_ping: ping.encrypted_ping, $timestamp: ping.timestamp});
    }

    static getPing(sender_user_id: string): Ping {
        const ping: Ping = db.prepare(
            `SELECT * 
            FROM positions 
            WHERE user_id = $user_id`
        ).get({ $user_id: sender_user_id }) as Ping;
        return ping;
    }

    static generateRegistrationKey(timestamp: string): string {
        let registration_key = crypto.randomUUID();
        db.prepare(
            `INSERT INTO registration_keys 
            (registration_key, timestamp) 
            VALUES ($registration_key, $timestamp)`
        ).run({$registration_key: registration_key, $timestamp: timestamp});

        db.prepare(
            `UPDATE registration_keys 
            SET timestamp = $timestamp 
            WHERE registration_key IS NULL`
        ).run({ $timestamp: timestamp });

        return registration_key;
    }

    static updateLocationKey(location_key: LocationKey) {
        db.prepare(
            `DELETE FROM location_keys 
            WHERE sender_user_id = $sender_user_id`
        ).run({ $sender_user_id: location_key.sender_user_id });

        db.prepare(
            `INSERT INTO location_keys 
            (user_id, location_key, timestamp) 
            VALUES ($sender_user_id, $receiver_user_id, $location_key, $timestamp)`
        ).run({$sender_user_id: location_key.sender_user_id, $receiver_user_id: location_key.receiver_user_id, $location_key: location_key.location_key, $timestamp: location_key.timestamp});
    }

    static getLocationKey(sender_user_id: string, receiver_user_id: string): LocationKey {
        const location_key: LocationKey = db.prepare(
            `SELECT * 
            FROM location_keys 
            WHERE user_id = $user_id`
        ).get({ $sender_user_id: sender_user_id, $receiver_user_id: receiver_user_id }) as LocationKey;
        return location_key;
    }

    static getPublicSigningKey(user_id: string): string {
        const result: string = db.prepare(
            `SELECT public_signing_key 
            FROM users 
            WHERE user_id = $user_id`
        ).get({ $user_id: user_id }) as string;

        return result;
    }

    static isRegistrationKeyValidAndDelete(registration_key: string): boolean {
        const result = db.prepare(
            `SELECT * 
            FROM registration_keys 
            WHERE registration_key = $registration_key`
        ).get({ $registration_key: registration_key });

        if (result) {
            db.prepare(
                `DELETE FROM registration_keys 
                WHERE registration_key = $registration_key`
            ).run({ $registration_key: registration_key });
            return true;
        }
        return false;
    }

    static isPingBeforeLastOne(user_id: string, new_timestamp: string): boolean {
        const lastPing: Ping = db.prepare(
            `SELECT timestamp 
            FROM positions 
            WHERE user_id = $user_id`
        ).get({ $user_id: user_id }) as Ping;

        return lastPing && new_timestamp < lastPing.timestamp;
    }

    static isNewAdminTimestampBeforeLastOne(new_timestamp: string): boolean {
        const last_admin_timestamp_entry: string = db.prepare(
            `SELECT timestamp 
            FROM registration_keys 
            WHERE registration_key IS NULL`
        ).get() as string;
    
        return new_timestamp < last_admin_timestamp_entry;
    }

    static isLocationKeyBeforeLastOne(user_id: string, new_timestamp: string): boolean {
        const lastLocationKey: LocationKey = db.prepare(
            `SELECT timestamp 
            FROM location_keys 
            WHERE user_id = $user_id`
        ).get({ $user_id: user_id }) as LocationKey;

        return lastLocationKey && new_timestamp < lastLocationKey.timestamp;
    }
}
