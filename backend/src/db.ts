import { Database } from "bun:sqlite";
import type { Ping, User } from "./models";

const db = new Database("database.sqlite", { create: true, strict: true });

db.prepare(
	`
	CREATE TABLE IF NOT EXISTS positions (
		sender_id TEXT,
		receiver_id TEXT,
		encrypted_ping TEXT,
		recency_index INTEGER
	)
`,
).run();

// CREATE TRIGGER IF NOT EXISTS increment_recency_index
// BEFORE INSERT ON positions
// FOR EACH ROW
// BEGIN
//     -- Calculate the next recency_index for the given sender_id and receiver_id
//     SELECT IFNULL(MAX(recency_index), -1) + 1
//     INTO NEW.recency_index
//     FROM positions
//     WHERE sender_id = NEW.sender_id AND receiver_id = NEW.receiver_id;
// END;

db.prepare(
	`
	CREATE TABLE IF NOT EXISTS users (
		user_id TEXT UNIQUE,
		pub_sign_key TEXT UNIQUE,
		last_action_timestamp INTEGER
	)
`,
).run();

db.prepare(
	`
	CREATE TABLE IF NOT EXISTS signup_keys (
		key TEXT UNIQUE
	)
`,
).run();

export class ServerDatabase {
	static insertSignupKey(signup_key: string) {
		db.prepare(`INSERT INTO signup_keys (key) VALUES (?)`).run(signup_key);
	}

	static consumeSignupKey(signup_key: string) {
		const { changes } = db.prepare(`DELETE FROM signup_keys WHERE key = ?`).run(signup_key);
		return changes > 0;
	}

	static createUser(user: User) {
		const { user_id, pub_sign_key, last_action_timestamp } = user;

		db.prepare(
			`
			INSERT INTO users (user_id, pub_sign_key, last_action_timestamp)
			VALUES (?, ?, ?)
		`,
		).run(user_id, pub_sign_key, last_action_timestamp);
	}

	static createPing(ping: Ping) {
		db.prepare(
			`
			DELETE FROM positions
			WHERE sender_id = ?
			AND receiver_id = ?
		`,
		).run(ping.sender_id, ping.receiver_id);

		db.prepare(
			`
			INSERT INTO positions (sender_id, receiver_id, encrypted_ping)
			VALUES (?, ?, ?)
		`,
		).run(ping.sender_id, ping.receiver_id, ping.encrypted_ping);
	}

	static getPing(sender_id: string, receiver_id: string): Ping | null {
		const result = db
			.prepare(
				`
			SELECT encrypted_ping
			FROM positions
			WHERE sender_id = ? AND receiver_id = ?
		`,
			)
			.get(sender_id, receiver_id) as Ping;

		if (result) {
			return {
				sender_id,
				receiver_id,
				encrypted_ping: result.encrypted_ping,
			};
		}

		return null;
	}
}
