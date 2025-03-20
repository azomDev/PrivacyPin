import { randomUUIDv7 } from "bun";
import * as db from "./database";
import type { GlobalSignData as SignData } from "../../shared/globalTypes";
import { getBufferForSignature } from "../../shared/utils";
import { Database } from "bun:sqlite";

const challenge_db = new Database(":memory:");
challenge_db.run(`
	CREATE TABLE IF NOT EXISTS challenges (
		challenge TEXT PRIMARY KEY,
		cleanup_id INTEGER
	)
`);

// random thought, but if you close the server and the challenges are "reseted", then if you quickly open the server again someone can send a replay attack

let next_cleanup_index = 0;
const max_cleanup_index = 3;

setInterval(() => {
	challenge_db.prepare("DELETE FROM challenges WHERE cleanup_id = ?").run(next_cleanup_index);
	next_cleanup_index = (next_cleanup_index + 1) % (max_cleanup_index + 1);
	console.log(`Cleaned up challenges with cleanup_id = ${next_cleanup_index}`);
}, 60 * 1000); // 60 seconds

export async function isSignatureValid(content_as_string: string, sign_data: SignData): Promise<boolean> {
	const CHALLENGE_LIFETIME = 30 * 1000; // 30 seconds
	if (Date.now() - Number(sign_data.timestamp) > CHALLENGE_LIFETIME) {
		throw new Error("Challenge expired");
	}

	// prettier-ignore
	const result = challenge_db.prepare(`
		SELECT EXISTS (SELECT 1 FROM challenges WHERE challenge = ?) AS challenge_exists
	`).get(sign_data.nonce) as {challenge_exists: number};

	if (result.challenge_exists === 1) throw new Error("Challenge already used");

	////////////////////////////
	////////////////////////////
	////////////////////////////

	const buffer_to_verify = getBufferForSignature(content_as_string, sign_data.nonce, sign_data.timestamp, sign_data.user_id);

	const raw_public_key = db.getPubKey(sign_data.user_id);
	console.log(buffer_to_verify);
	if (raw_public_key === null) throw new Error("Public key not found");
	const parsed_public_key = JSON.parse(raw_public_key) as JsonWebKey;

	const public_key = await crypto.subtle.importKey("jwk", parsed_public_key, "Ed25519", false, ["verify"]);

	const signature_valid = await crypto.subtle.verify(
		{
			name: "Ed25519",
		},
		public_key,
		Uint8Array.fromBase64(sign_data.signature),
		buffer_to_verify,
	);

	if (!signature_valid) return false;

	const cleanup_id = (next_cleanup_index + 2) % (max_cleanup_index + 1);
	// prettier-ignore
	challenge_db.prepare(`
		INSERT INTO challenges (challenge, cleanup_id) VALUES (?, ?)
	`).run(sign_data.nonce, cleanup_id);

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
	if (db.hasSignupKeys()) return; // No need to init the server
	const new_signup_key = randomUUIDv7();
	db.insertSignupKey(new_signup_key);
	console.log(`Admin signup key: ${new_signup_key}`);
}
