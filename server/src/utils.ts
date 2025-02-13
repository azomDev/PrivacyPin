import { randomUUIDv7 } from "bun";
import type { Challenge, SignData } from "./models";
import { ServerDatabase as db } from "./database";

export const challenges = new Map<string, Challenge>();

export function isSignatureValid(content_as_string: string, sign_data: SignData): boolean {
	// temp info, content_as_string is an empty string for a GET request (which has no body)
	// todo the rest

	// the server receives the request on the chosen api, and checks if their is an entry for a challenge for that user_id
	// the server checks the validity of the signature and if everything is ok, can process the request
	// the validity should not be if the entry is present in the challenges object, it should check the timestamp inside with the current timestamp
	return true;
}

export async function isAdmin(user_id: string): Promise<boolean> {
	const admin_file = Bun.file("admin_id.txt");
	const admin_id = await admin_file.text();
	return user_id === admin_id;
}

export async function initServer() {
	const admin_file = Bun.file("admin_id.txt");
	if (await admin_file.exists()) return; // No need to init the server
	if (!db.noSignupKeys()) return; // No need to init the server
	const new_signup_key = randomUUIDv7();
	db.insertSignupKey(new_signup_key);
	console.log(`Admin signup key: ${new_signup_key}`);
}
