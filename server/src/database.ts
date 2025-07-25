import { Database } from "bun:sqlite";
import type { ServerPing, ServerUser } from "@privacypin/shared";
import { CONFIG } from "./config";
import { mkdir } from "node:fs/promises";

let db: Database;
await mkdir("./output", {recursive: true});
initializeDatabase();

const PING_BUFFER_SIZE = 20;

function initializeDatabase() {
	db = new Database(CONFIG.DATABASE_PATH, { create: true, strict: true });
	// todo later do the rotating recency indexes for better privacy
	db.run(`
		CREATE TABLE IF NOT EXISTS positions (
			sender_id TEXT,
			receiver_id TEXT,
			encrypted_ping TEXT,
			recency_index INTEGER,
			UNIQUE(sender_id, receiver_id, recency_index)
		)
	`);

	db.run(`
		CREATE TABLE IF NOT EXISTS links (
			user_id_1 TEXT,
			user_id_2 TEXT,
			user_1_ping_index INTEGER, -- todo add default when created
			user_2_ping_index INTEGER, -- todo add default when created
			CHECK(user_id_1 < user_id_2),
			UNIQUE(user_id_1, user_id_2)
		)
	`);

	db.run(`
		CREATE TABLE IF NOT EXISTS users (
			user_id TEXT UNIQUE
		)
	`);
}

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

export function noUsers(): boolean {
	// prettier-ignore
	const result = db.prepare(`
		SELECT EXISTS (SELECT 1 FROM users) AS user_exists
	`).get() as { user_exists: number };

	return result.user_exists === 0;
}

export function linkExists(user_id_1: string, user_id_2: string): boolean {
	// prettier-ignore
	const result = db.prepare(`
		SELECT * FROM links
		WHERE
			(user_id_1 = $id1 AND user_id_2 = $id2)
			OR (user_id_1 = $id2 AND user_id_2 = $id1)
	`).get({ id1: user_id_1, id2: user_id_2 });

	return result !== null;
}

export function createUser(user: ServerUser) {
	// prettier-ignore
	db.prepare(`
		INSERT INTO users (user_id) VALUES (?)
	`).run(user.user_id);
}

export function addPings(pings: ServerPing[]) {

	const get_recency_index_query = db.prepare(`
		SELECT
			CASE
				WHEN user_id_1 = $sender_id THEN user_1_ping_index
				ELSE user_2_ping_index
			END AS recency_index
		FROM links
		WHERE
			(user_id_1 = $sender_id AND user_id_2 = $receiver_id)
			OR (user_id_1 = $receiver_id AND user_id_2 = $sender_id)
	`);

	const update_recency_index_query = db.prepare(`
		UPDATE links
		SET
			user_1_ping_index = CASE WHEN user_id_1 = $sender_id THEN $new_index ELSE user_1_ping_index END,
			user_2_ping_index = CASE WHEN user_id_2 = $sender_id THEN $new_index ELSE user_2_ping_index END
		WHERE
			(user_id_1 = $sender_id AND user_id_2 = $receiver_id)
			OR (user_id_1 = $receiver_id AND user_id_2 = $sender_id)
	`);

	const ping_insert_query = db.prepare(`
		INSERT INTO positions (sender_id, receiver_id, encrypted_ping, recency_index)
		VALUES (?, ?, ?, ?)
		ON CONFLICT(sender_id, receiver_id, recency_index) DO UPDATE SET
			encrypted_ping = excluded.encrypted_ping
	`);

	db.transaction(() => {
		for (const ping of pings) {
			const { recency_index } = get_recency_index_query.get({sender_id: ping.sender_id, receiver_id: ping.receiver_id}) as { recency_index: number };
			const new_recency_index = recency_index + 1 % PING_BUFFER_SIZE;
			update_recency_index_query.run({ sender_id: ping.sender_id, receiver_id: ping.receiver_id, new_recency_index });
			ping_insert_query.run(ping.sender_id, ping.receiver_id, ping.encrypted_ping, recency_index);
		}
	})();
}

export function getPings(sender_id: string, receiver_id: string): string[] | null {
	const get_recency_index_query = db.prepare(`
		SELECT
			CASE
				WHEN user_id_1 = $sender_id THEN user_1_ping_index
				ELSE user_2_ping_index
			END AS recency_index
		FROM links
		WHERE
			(user_id_1 = $sender_id AND user_id_2 = $receiver_id)
			OR (user_id_1 = $receiver_id AND user_id_2 = $sender_id)
	`);

	const { recency_index } = get_recency_index_query.get({ sender_id, receiver_id }) as { recency_index: number };

	const pings_res = db.prepare(`
		SELECT encrypted_ping, recency_index
		FROM positions
		WHERE sender_id = $sender_id AND receiver_id = $receiver_id
		ORDER BY recency_index
	`).all({ sender_id, receiver_id }) as { encrypted_ping: string; recency_index: number }[] | null;

	if (pings_res === null) return null;

	const buffer = new Array<string | undefined>(PING_BUFFER_SIZE);

	for (const row of pings_res) {
		buffer[row.recency_index] = row.encrypted_ping;
	}

	const sorted_pings: string[] = [];

	for (let offset = 0; offset < PING_BUFFER_SIZE; offset++) {
		const i = (recency_index - offset + PING_BUFFER_SIZE) % PING_BUFFER_SIZE;
		const ping = buffer[i];
		if (ping !== undefined) {
			sorted_pings.push(ping);
		}
	}

	return sorted_pings;
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
