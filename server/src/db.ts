import { Database } from "bun:sqlite";
import type { Ping, User } from "./models";

const db = new Database("database.sqlite", { create: true, strict: true });

// todo fix positions to have recency working everywhere
db.run(
	`
	CREATE TABLE IF NOT EXISTS positions (
		sender_id TEXT,
		receiver_id TEXT,
		encrypted_ping TEXT,
		UNIQUE(sender_id, receiver_id) -- for now, we will only have one ping per directional user pair
		-- recency_index INTEGER
	)
`,
);

db.run(
	`
	CREATE TABLE IF NOT EXISTS friend_requests (
		sender_id TEXT,
		accepter_id TEXT,
		UNIQUE(sender_id, accepter_id)
	)
`,
);

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

db.run(
	`
	CREATE TABLE IF NOT EXISTS users (
		user_id TEXT UNIQUE,
		pub_sign_key TEXT UNIQUE,
		last_action_timestamp INTEGER -- later, change this to a challenge-response system that uses for example a UUIDv7 challenge so there is still the timestamp, but it is not stored.
	)
`,
);

// later, we want that with every requests (or every few requests), we rotate the pub_sign_key, but keeping a long term key in case the device is unable to rotate the key for some amount of time.

db.run(
	`
	CREATE TABLE IF NOT EXISTS signup_keys (
		key TEXT UNIQUE
	)
`,
);

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
		const delete_query = db.prepare(
			`
			DELETE FROM positions
			WHERE sender_id = ?
			AND receiver_id = ?
		`,
		);

		const insert_query = db.prepare(
			`
			INSERT INTO positions
			(sender_id, receiver_id, encrypted_ping)
			VALUES (?, ?, ?)
		`,
		);

		db.transaction(() => {
			delete_query.run(ping.sender_id, ping.receiver_id);
			insert_query.run(ping.sender_id, ping.receiver_id, ping.encrypted_ping);
		})();
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
