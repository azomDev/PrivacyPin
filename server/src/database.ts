import { Database } from "bun:sqlite";
import type { Ping, User } from "./models";

const db = new Database("database.sqlite", { create: true, strict: true });
initializeDatabase();

function initializeDatabase() {
	db.run(`
		CREATE TABLE IF NOT EXISTS positions (
			sender_id TEXT,
			receiver_id TEXT,
			encrypted_ping BLOB,
			recency_index INTEGER,
			UNIQUE(sender_id, receiver_id, recency_index)
		)
	`);

	db.run(`
		CREATE TABLE IF NOT EXISTS friend_requests (
			sender_id TEXT,
			accepter_id TEXT,
			UNIQUE(sender_id, accepter_id)
		)
	`);

	db.run(`
		CREATE TABLE IF NOT EXISTS links (
			user_id_1 TEXT,
			user_id_2 TEXT,
			user_1_max_ping INTEGER DEFAULT 1,
			user_2_max_ping INTEGER DEFAULT 1,
			user_1_ping_index INTEGER DEFAULT 0,
			user_2_ping_index INTEGER DEFAULT 0,
			CHECK(user_id_1 < user_id_2),
			UNIQUE(user_id_1, user_id_2)
		)
	`);

	db.run(`
		CREATE TABLE IF NOT EXISTS users (
			user_id TEXT UNIQUE,
			pub_sign_key BLOB UNIQUE
		)
	`);

	db.run(`
		CREATE TABLE IF NOT EXISTS signup_keys (
			key TEXT UNIQUE
		)
	`);
}

export function getPubKey(user_id: string): string | null {
	// prettier-ignore
	const result = db.prepare(`
		SELECT pub_sign_key FROM users WHERE user_id = ?
	`).get(user_id) as null | {pub_sign_key: string};

	if (result === null) return null;

	return result.pub_sign_key;
}

export function noUsers(): boolean {
	// prettier-ignore
	const result = db.prepare(`
		SELECT EXISTS (SELECT 1 FROM users) AS user_exists
	`).get() as {user_exists: number};

	return result.user_exists === 0;
}

export function hasSignupKeys(): boolean {
	//prettier-ignore
	const result = db.prepare(`
		SELECT EXISTS (SELECT 1 FROM signup_keys) AS signup_key_exists
	`).get() as {signup_key_exists: number};

	return result.signup_key_exists === 1;
}

export function linkExists(user_id_1: string, user_id_2: string): boolean {
	// prettier-ignore
	const result = db.prepare(`
		SELECT * FROM links
		WHERE
			(user_id_1 = $id1 AND user_id_2 = $id2)
			OR  (user_id_1 = $id2 AND user_id_2 = $id1)
	`).get({ id1: user_id_1, id2: user_id_2 });

	return result !== null;
}

export function insertSignupKey(signup_key: string) {
	// prettier-ignore
	db.prepare(`
		INSERT INTO signup_keys (key) VALUES (?)
	`).run(signup_key);
}

export function consumeSignupKey(signup_key: string) {
	// prettier-ignore
	const { changes } = db.prepare(`
		DELETE FROM signup_keys WHERE key = ?
	`).run(signup_key);

	return changes > 0;
}

export function createUser(user: User) {
	// prettier-ignore
	db.prepare(`
		INSERT INTO users (user_id, pub_sign_key) VALUES (?, ?)
	`).run(user.user_id, user.pub_sign_key);
}

export function addPing(ping: Ping) {
	const index_update_query = db.prepare(`
			UPDATE links
			SET
				user_1_ping_index = CASE
					WHEN user_id_1 = $sender_id THEN (user_1_ping_index + 1) % user_1_max_ping
					ELSE user_1_ping_index
				END,
				user_2_ping_index = CASE
					WHEN user_id_2 = $sender_id THEN (user_2_ping_index + 1) % user_2_max_ping
					ELSE user_2_ping_index
				END
			WHERE
				(user_id_1 = $sender_id AND user_id_2 = $receiver_id)
				OR (user_id_1 = $receiver_id AND user_id_2 = $sender_id)
		`);

	// todo check this sql statement to check if it is correct
	const ping_insert_query = db.prepare(`
			INSERT INTO positions (sender_id, receiver_id, encrypted_ping, recency_index)
			SELECT
				$sender_id AS sender_id,
				$receiver_id AS receiver_id,
				$encrypted_ping AS encrypted_ping,
				CASE
					WHEN $sender_id = user_id_1 THEN user_1_ping_index
					ELSE user_2_ping_index
				END AS recency_index
			FROM links
			WHERE
				(user_id_1 = $sender_id AND user_id_2 = $receiver_id)
				OR (user_id_1 = $receiver_id AND user_id_2 = $sender_id)
			ON CONFLICT(sender_id, receiver_id, recency_index)
			DO UPDATE SET encrypted_ping = excluded.encrypted_ping
		`);

	db.transaction(() => {
		index_update_query.run({ sender_id: ping.sender_id, receiver_id: ping.receiver_id });
		ping_insert_query.run({
			sender_id: ping.sender_id,
			receiver_id: ping.receiver_id,
			encrypted_ping: ping.encrypted_ping,
		});
	})();
}

export function getPings(sender_id: string, receiver_id: string): Ping[] | null {
	// prettier-ignore
	const result = db.prepare(`
		SELECT encrypted_ping FROM positions
		WHERE sender_id = ? AND receiver_id = ?
	`).all(sender_id, receiver_id) as Ping[] | null;

	return result;
}

export function createFriendRequest(sender_id: string, accepter_id: string) {
	// prettier-ignore
	db.prepare(`
		INSERT OR IGNORE INTO friend_requests (sender_id, accepter_id) VALUES (?, ?)
	`).run(sender_id, accepter_id);
}

export function consumeFriendRequest(sender_id: string, accepter_id: string): boolean {
	// prettier-ignore
	const { changes } = db.prepare(`
		DELETE FROM friend_requests WHERE sender_id = ? AND accepter_id = ?
	`).run(sender_id, accepter_id);

	return changes > 0;
}

export function createLink(user_id_1: string, user_id_2: string) {
	// prettier-ignore
	db.prepare(`
		INSERT INTO links (user_id_1, user_id_2)
		VALUES (LEAST($id1, $id2), GREATEST($id1, $id2))
	`).run({ id1: user_id_1, id2: user_id_2 });
}
