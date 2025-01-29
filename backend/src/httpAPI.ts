import { randomUUIDv7 } from "bun";
import { ServerDatabase as db } from "./db";
import type { User } from "./models";

export function createAccount(signup_key: string, pub_sign_key: string): Response {
	if (!db.consumeSignupKey(signup_key)) {
		return new Response("Invalid signup key", { status: 400 });
	}
	const user_id = randomUUIDv7();
	const user: User = { user_id, pub_sign_key, last_action_timestamp: Date.now() };
	db.createUser(user);
	return new Response(user_id);
}

export function generateSignupKey(): Response {
	return new Response(randomUUIDv7());
}
