// Implementation of https://github.com/azomDev/Protocol-Concepts/blob/main/proto1.md

import * as db from "./database";
import type { GlobalSignData as SignData } from "@privacypin/shared";
import { Err, getBufferForSignature } from "@privacypin/shared";
import { CyclicExpiryQueue } from "./cyclic-expiry-queue";

const CHALLENGE_LIFETIME = 30 * 1000; // 30 seconds
const challenges_queue = new CyclicExpiryQueue<string>(2 * CHALLENGE_LIFETIME);

export async function isSignatureValid(content_as_string: string, sign_data: SignData): Promise<boolean> {
	validateChallenge(sign_data);

	const buffer_to_verify = getBufferForSignature(content_as_string, sign_data.nonce, sign_data.timestamp, sign_data.user_id);

	const is_valid = await verifySignature(sign_data, buffer_to_verify);
	if (!is_valid) return false;

	challenges_queue.add(sign_data.nonce);

	return true;
}

function validateChallenge(sign_data: SignData): void {
	// Casting to Number is safe because if an attacker changes timestamp, the signature will be invalid anyways
	if (Date.now() - Number(sign_data.timestamp) > CHALLENGE_LIFETIME) {
		throw new Err("Challenge expired", true);
	}

	if (challenges_queue.has(sign_data.nonce)) {
		throw new Err("Challenge already used", true);
	}
}

async function verifySignature(sign_data: SignData, buffer_to_verify: BufferSource): Promise<boolean> {
	const raw_public_key = db.getPubKey(sign_data.user_id);
	if (raw_public_key === null) throw new Err("Public key not found", true);

	const parsed_public_key = JSON.parse(raw_public_key) as JsonWebKey;
	const public_key = await crypto.subtle.importKey("jwk", parsed_public_key, "Ed25519", false, ["verify"]);

	return await crypto.subtle.verify(
		{ name: "Ed25519" },
		public_key,
		Uint8Array.fromBase64(sign_data.signature),
		buffer_to_verify,
	);
}
