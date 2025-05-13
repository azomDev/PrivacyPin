import { Database } from "bun:sqlite";
import type { ServerPing, ServerUser } from "@privacypin/shared";
import { CONFIG } from "../config";
import { integer, schema, text } from "./schema";
import { TypesafeDB } from "./db";
import { and, eq } from "./condition";

// todo redesign schema to not have to duplicate table names
const positions = schema("positions", {
    sender_id: text("sender_id"),
    receiver_id: text("receiver_id"),
	encrypted_ping: text("encrypted_ping"),
	recency_index: integer("recency_index")// TODO: PRIMARY KEY AUTOINCREMENT
	// TODO: UNIQUE(sender_id, receiver_id, recency_index)
});

const friend_requests = schema("friend_requests", {
	sender_id: text("sender_id"),
	accepter_id: text("accepter_id")
	// TODO: UNIQUE(sender_id, accepter_id)
});

const links = schema("links", {
	user_id_1: text("user_id_1"),
	user_id_2: text("user_id_2")
	// TODO: CHECK(user_id_1 < user_id_2)
	// TODO: UNIQUE(user_id_1, user_id_2)
})

const users = schema("users", {
	user_id: text("user_id"), // TODO: UNIQUE
	pub_sign_key: text("pub_sign_key") // TODO: UNIQUE
})

const signup_keys = schema("signup_keys", {
	key: text("key"), // TODO: UNIQUE
})

const db = new TypesafeDB("test.sqlite", [positions, friend_requests, links, users, signup_keys]);

export function getPubKey(user_id: string): string | null {
	const result = db
		.table("users")
		.select("pub_sign_key")
		.where(eq("user_id", user_id))
		.get();

	if (result === null) return null;

	return result.pub_sign_key; // TODO: make the db return the value directly
}

export function noUsers(): boolean {
	return db.table("users").isEmpty();
}

export function hasSignupKeys(): boolean {
	return !db.table("signup_keys").isEmpty();
}

export function linkExists(user_id_1: string, user_id_2: string): boolean {
	const [id1, id2] = user_id_1 < user_id_2 ? [user_id_1, user_id_2] : [user_id_2, user_id_1];
	const result = db
		.table("links")
		.select()
		.where(and(eq("user_id_1", id1), eq("user_id_2", id2)))
		.get();

	return result !== null;
}

export function insertSignupKey(signup_key: string) {
	db.table("signup_keys").insert({ key: signup_key }).run();
}

export function consumeSignupKey(signup_key: string) {
	const { changes } = db
		.table("signup_keys")
		.delete()
		.where(eq("key", signup_key))
		.run();
	return changes > 0;
}

export function createUser(user: ServerUser) {
	db.table("users").insert(user).run();
}

export function addPings(pings: ServerPing[]) {
	// db.table("positions").insert(pings) TODO
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
	const result = db
		.table("positions")
		.select("encrypted_ping")
		.where(and(eq("sender_id", sender_id), eq("receiver_id", receiver_id)))
		.orderBy("recency_index")
		.all();

	if (result === null) return null;

	return result.map((row) => row.encrypted_ping);
}

export function createFriendRequest(sender_id: string, accepter_id: string) {
	db.table("friend_requests").insert({ sender_id, accepter_id }).run(); // TODO: INSERT OR IGNORE
}

export function consumeFriendRequest(sender_id: string, accepter_id: string): boolean {
	const { changes } = db
		.table("friend_requests")
		.delete()
		.where(and(eq("sender_id", sender_id), eq("accepter_id", accepter_id)))
		.run();
	return changes > 0;
}

export function createLink(user_id_1: string, user_id_2: string) {
	const [id1, id2] = user_id_1 < user_id_2 ? [user_id_1, user_id_2] : [user_id_2, user_id_1];
	db.table("links").insert({ user_id_1: id1, user_id_2: id2 }).run();
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
