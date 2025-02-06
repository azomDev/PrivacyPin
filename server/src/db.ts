import { Database } from "bun:sqlite";
import type { Ping, User } from "./models";

const db = new Database("database.sqlite", { create: true, strict: true });

// todo fix positions to have recency working everywhere
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

db.prepare(
	`
	CREATE TABLE IF NOT EXISTS friend_requests (
		sender_id TEXT,
		accepter_id TEXT,
		UNIQUE(sender_id, accepter_id)
	)
`,
).run();

db.prepare(
	`
	CREATE TABLE IF NOT EXISTS links (
		user_id_1 TEXT,
		user_id_2 TEXT,
		CHECK(user_id_1 < user_id_2),
		UNIQUE(user_id_1, user_id_2)
	)
`,
).run();

db.prepare(
	`
	CREATE TRIGGER IF NOT EXISTS increment_recency_index
	BEFORE INSERT ON positions
	FOR EACH ROW
	BEGIN
		-- Calculate the next recency_index for the given sender_id and receiver_id
		SELECT IFNULL(MAX(recency_index), -1) + 1
		INTO NEW.recency_index
		FROM positions
		WHERE sender_id = NEW.sender_id AND receiver_id = NEW.receiver_id;

		-- Get the maximum pings for this user
		DECLARE max_pings INTEGER;

		SELECT max_pings INTO max_pings
		FROM users
		WHERE user_id = NEW.sender_id;

		-- If the number of pings exceeds the limit, delete the oldest ones
		DELETE FROM positions
		WHERE sender_id = NEW.sender_id AND receiver_id = NEW.receiver_id
		AND recency_index < (SELECT MAX(recency_index) - max_pings + 1
				FROM positions
				WHERE sender_id = NEW.sender_id AND receiver_id = NEW.receiver_id);
	END;
`,
).run();

db.prepare(
	`
	CREATE TABLE IF NOT EXISTS users (
		user_id TEXT UNIQUE,
		pub_sign_key TEXT UNIQUE,
		last_action_timestamp INTEGER,
		max_pings INTEGER
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
	static linkExists(user_id_1: string, user_id_2: string): boolean {
		const [id1, id2] = user_id_1 < user_id_2 ? [user_id_1, user_id_2] : [user_id_2, user_id_1];
		const result = db.prepare(`SELECT * FROM links WHERE user_id_1 = ? AND user_id_2 = ?`).get(id1, id2);
		return result !== null;
	}

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

	static addPing(ping: Ping) {
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
			.get(sender_id, receiver_id) as Ping | null;

		return result;
	}

	static createFriendRequest(sender_id: string, accepter_id: string) {
		db.prepare(`INSERT INTO friend_requests (sender_id, accepter_id) VALUES (?, ?)`).run(sender_id, accepter_id);
	}

	static consumeFriendRequest(sender_id: string, accepter_id: string): boolean {
		const { changes } = db.prepare(`DELETE FROM friend_requests WHERE sender_id = ? AND accepter_id = ?`).run(sender_id, accepter_id);
		return changes > 0;
	}

	static createLink(user_id_1: string, user_id_2: string) {
		const [id1, id2] = user_id_1 < user_id_2 ? [user_id_1, user_id_2] : [user_id_2, user_id_1];
		db.prepare(`INSERT INTO links (user_id_1, user_id_2) VALUES (?, ?)`).run(id1, id2);
	}
}
