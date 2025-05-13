import { Database } from "bun:sqlite";
import type { ServerPing, ServerUser } from "@privacypin/shared";
import { CONFIG } from "./config";
import { mkdir } from "node:fs/promises";

let db: Database;
await mkdir("./output");
initializeDatabase();

function initializeDatabase() {
	db = new Database(CONFIG.DATABASE_PATH, { create: true, strict: true });
	// todo later do the rotating recency indexes for better privacy
	db.run(`
		CREATE TABLE IF NOT EXISTS positions (
			sender_id TEXT,
			receiver_id TEXT,
			encrypted_ping TEXT, -- in base64 when encrypted mabye? todo
			recency_index INTEGER PRIMARY KEY AUTOINCREMENT,
			UNIQUE(sender_id, receiver_id, recency_index)
		)
	`);

	db.run(`
		CREATE TABLE IF NOT EXISTS links (
			user_id_1 TEXT,
			user_id_2 TEXT,
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
}

// todo for typesafe database
//
// create tables
//
// SELECT col1 FROM table WHERE col2 = ?
//
// SELECT EXISTS (SELECT 1 FROM table) AS newName
// so an easy exist function
//
// SELECT * FROM table
// WHERE
// 	(col1 = $val1 AND col2 = $val2)
// 	OR  (col1 = $val2 AND col2 = $val1)
//
//
// DELETE FROM table WHERE col1 = ? AND col2 = ?
//
// INSERT INTO table (col1, col2) VALUES (?, ?)
//
// transactions
//
// 		SELECT col1
// FROM table
// WHERE col2 = $val1 AND col3 = $val2
// ORDER BY col4
//
// INSERT OR IGNORE INTO friend_requests (sender_id, accepter_id) VALUES (?, ?)
// but mabye the ignore is not needed so its like one of the examples above
//
// INSERT INTO links (user_id_1, user_id_2)
// 	VALUES (
// 		CASE WHEN $id1 < $id2 THEN $id1 ELSE $id2 END,
// 		CASE WHEN $id1 > $id2 THEN $id1 ELSE $id2 END
// 	);
//
//
// things we dont need to do
// reset database

export function RESET_DATABASE_FOR_TESTING() {
	try {
		db.run("PRAGMA foreign_keys = OFF;"); // Disable foreign key constraints temporarily

		const tables = db.query("SELECT name FROM sqlite_master WHERE type='table';").all() as { name: string }[];
		for (const table of tables) {
			if (table.name !== "sqlite_sequence") {
				db.run(`DELETE FROM ${table.name};`);
			}
		}

		db.run("PRAGMA foreign_keys = ON;"); // Re-enable foreign key constraints
	} catch (error) {
		console.error("Error resetting database:", error);
	}
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

export function createUser(user: ServerUser) {
	// prettier-ignore
	db.prepare(`
		INSERT INTO users (user_id, pub_sign_key) VALUES (?, ?)
	`).run(user.user_id, user.pub_sign_key);
}

export function addPings(pings: ServerPing[]) {
	const ping_insert_query = db.prepare(`
		INSERT INTO positions (sender_id, receiver_id, encrypted_ping) VALUES (?, ?, ?)
	`);

	db.transaction(() => {
		for (const ping of pings) {
			ping_insert_query.run(ping.sender_id, ping.receiver_id, ping.encrypted_ping);
		}
	})();
}

export function getPings(sender_id: string, receiver_id: string): string[] | null {
	// prettier-ignore
	const result = db.prepare(`
		SELECT encrypted_ping
		FROM positions
		WHERE sender_id = $sender_id AND receiver_id = $receiver_id
		ORDER BY recency_index
	`).all({ sender_id, receiver_id }) as {encrypted_ping: string}[] | null;

	if (result === null) return null;

	return result.map((row) => row.encrypted_ping);
}

export function createLink(user_id_1: string, user_id_2: string) {
	// prettier-ignore
	db.prepare(`
	INSERT INTO links (user_id_1, user_id_2)
	VALUES (
		CASE WHEN $id1 < $id2 THEN $id1 ELSE $id2 END,
		CASE WHEN $id1 > $id2 THEN $id1 ELSE $id2 END
	);
	`).run({ id1: user_id_1, id2: user_id_2 });
}
