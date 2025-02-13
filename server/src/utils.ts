import { randomUUIDv7 } from "bun";
import type { Challenge, SignData } from "./models";
import { ServerDatabase as db } from "./database";

export const challenges = new Map<string, Challenge>();

export async function isSignatureValid(content_as_string: string, sign_data: SignData): Promise<boolean> {
	const challenge = challenges.get(sign_data.user_id);
	if (challenge === undefined) return false;
	challenges.delete(sign_data.user_id);

	const CHALLENGE_LIFETIME = 10 * 1000; // 10 seconds
	if (Date.now() - challenge.timestamp > CHALLENGE_LIFETIME) {
		return false;
	}

	const string_to_verify = content_as_string + sign_data.user_id + challenge.nonce + challenge.timestamp;
	const buffer_to_verify = Buffer.from(string_to_verify);

	const raw_public_key = db.getPubKey(sign_data.user_id);
	if (raw_public_key === null) return false;

	const public_key = await crypto.subtle.importKey("raw", raw_public_key, "Ed25519", false, ["verify"]);

	const verifyResult = await crypto.subtle.verify(
		{
			name: "Ed25519",
		},
		public_key,
		sign_data.signature,
		buffer_to_verify,
	);

	return verifyResult;
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
