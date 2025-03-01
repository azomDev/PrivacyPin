import { expect } from "bun:test";

const BASE_URL = "http://localhost:8080";

export async function generateSignupKey(): Promise<string> {
	const response = await fetch(`${BASE_URL}/generate-signup-key`);
	expect(response.status).toBe(200);
	const body = await response.text();
	expect(body).toBeDefined();
	expect(body.trim().length).toBeGreaterThan(0);
	return body;
}

export async function createAccount(
	signup_key: string,
): Promise<{ user_id: string; private_sign_key: CryptoKey }> {
	// Generate Ed25519 key pair
	const key_pair = await crypto.subtle.generateKey("Ed25519", true, [
		"sign",
		"verify",
	]);

	// Export public key as raw bytes
	const pub_key_buffer = await crypto.subtle.exportKey(
		"raw",
		key_pair.publicKey,
	);
	const pub_key_array = new Uint8Array(pub_key_buffer);

	const accountResponse = await fetch(`${BASE_URL}/create-account`, {
		method: "POST",
		body: JSON.stringify({
			signup_key,
			pub_sign_key: pub_key_array.toBase64(),
		}),
	});

	expect(accountResponse.status).toBe(200);
	const user_id = await accountResponse.text();
	expect(user_id).toBeDefined();
	expect(user_id.trim().length).toBeGreaterThan(0);
	return { user_id, private_sign_key: key_pair.privateKey };
}

export async function createLink(
	signup_key1: string,
	signup_key2: string,
	user1: { user_id: string; private_sign_key: CryptoKey },
	user2: { user_id: string; private_sign_key: CryptoKey },
) {
	const friend_request = {
		sender_id: user1.user_id,
		accepter_id: user2.user_id,
	};

	const create_response = await challengeAndPost(
		"create-friend-request",
		JSON.stringify(friend_request),
		user1.user_id,
		user1.private_sign_key,
	);

	expect(create_response.status).toBe(200);

	const accept_response = await challengeAndPost(
		"accept-friend-request",
		JSON.stringify(friend_request),
		user2.user_id,
		user2.private_sign_key,
	);

	expect(accept_response.status).toBe(200);
}

export async function challengeAndPost(
	endpoint: string,
	body: string,
	user_id: string,
	private_sign_key: CryptoKey,
) {
	const challengeResponse = await fetch(`${BASE_URL}/challenge`, {
		method: "POST",
		body: user_id,
	});

	const challenge = await challengeResponse.text();

	const signature = await crypto.subtle.sign(
		"Ed25519",
		private_sign_key,
		new TextEncoder().encode(body + challenge),
	);

	const response = await fetch(`${BASE_URL}/${endpoint}`, {
		method: "POST",
		headers: {
			"sign-data": JSON.stringify({
				signature: new Uint8Array(signature).toBase64(),
				user_id,
			}),
		},
		body,
	});

	return response;
}
