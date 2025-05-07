import { randomUUIDv7 } from "bun";
import * as db from "./database";
import type { GlobalSignData as SignData } from "@privacypin/shared";
import { getBufferForSignature } from "@privacypin/shared";

// todo cleanup of signup keys
// todo cleanup of friend requests

const challenges = new Map<string, number>();

let next_cleanup_index = 0;
const max_cleanup_index = 3;
const CHALLENGE_LIFETIME = 30 * 1000; // 30 seconds

setInterval(() => {
	for (const [challenge, cleanup_id] of challenges) {
		if (cleanup_id === next_cleanup_index) {
			challenges.delete(challenge);
		}
	}
	next_cleanup_index = (next_cleanup_index + 1) % (max_cleanup_index + 1);
	console.log(`Cleaned up challenges with cleanup_id = ${next_cleanup_index}`);
}, 60 * 1000); // 60 seconds

export async function isSignatureValid(content_as_string: string, sign_data: SignData): Promise<boolean> {
	validateChallenge(sign_data);

	const buffer_to_verify = getBufferForSignature(content_as_string, sign_data.nonce, sign_data.timestamp, sign_data.user_id);

	const is_valid = await verifySignature(sign_data, buffer_to_verify);
	if (!is_valid) return false;

	const cleanup_id = (next_cleanup_index + 2) % (max_cleanup_index + 1);
	challenges.set(sign_data.nonce, cleanup_id);

	return true;
}

function validateChallenge(sign_data: SignData): void {
	// Casting to Number is safe because if an attacker changes timestamp, the signature will be invalid anyways
	if (Date.now() - Number(sign_data.timestamp) > CHALLENGE_LIFETIME) {
		throw new Error("Challenge expired");
	}

	if (challenges.has(sign_data.nonce)) {
		throw new Error("Challenge already used");
	}
}

async function verifySignature(sign_data: SignData, buffer_to_verify: BufferSource): Promise<boolean> {
	const raw_public_key = db.getPubKey(sign_data.user_id);
	if (raw_public_key === null) throw new Error("Public key not found");

	const parsed_public_key = JSON.parse(raw_public_key) as JsonWebKey;
	const public_key = await crypto.subtle.importKey("jwk", parsed_public_key, "Ed25519", false, ["verify"]);

	return await crypto.subtle.verify(
		{ name: "Ed25519" },
		public_key,
		Uint8Array.fromBase64(sign_data.signature),
		buffer_to_verify,
	);
}
