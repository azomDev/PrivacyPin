import { expect } from "bun:test";

export const URL = "http://127.0.0.1:3000";

// Generate an Ed25519 keypair and register it with the server.
export async function generateUser(signup_key: string | undefined, should_be_admin: boolean = false): Promise<{ user_id: string; pubKey: Uint8Array; privKey: Uint8Array }> {
	if (!signup_key) {
		throw new Error("signup_key was not provided or captured from server output");
	}

	// Create Ed25519 keypair
	const keyPair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);

	// Export raw public key
	const pubKey = new Uint8Array(await crypto.subtle.exportKey("raw", keyPair.publicKey));
	const privKey = new Uint8Array(await crypto.subtle.exportKey("pkcs8", keyPair.privateKey));

	// Base64 encode the public key
	const pub_key_b64 = btoa(String.fromCharCode(...pubKey));

	// Send signup_key and pubkey to server
	const res = await fetch(`${URL}/create-account`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ signup_key, pub_key_b64 }),
	});

	expect(res.status).toBe(200);
	const json = await res.json();
	expect(json).toEqual({
		user_id: expect.any(String),
		is_admin: should_be_admin,
	});

	return { user_id: json.user_id, pubKey, privKey };
}

export async function post(endpoint: string, user: { user_id: string; privKey: Uint8Array }, data: Object | string | undefined): Promise<any> {
	let bodyBytes: Uint8Array;

	if (typeof data === "object") {
		const json = JSON.stringify(data);
		bodyBytes = new TextEncoder().encode(json);
	} else if (typeof data === "string") {
		bodyBytes = new TextEncoder().encode(data);
	} else {
		bodyBytes = new Uint8Array();
	}

	// Sign body using private key
	const privateKey = await crypto.subtle.importKey("pkcs8", user.privKey.buffer, { name: "Ed25519" }, false, ["sign"]);

	const signature = new Uint8Array(await crypto.subtle.sign("Ed25519", privateKey, bodyBytes));
	const signature_b64 = btoa(String.fromCharCode(...signature));

	const authJson = JSON.stringify({
		user_id: user.user_id,
		signature: signature_b64, // changed key
	});
	const authHeader = btoa(authJson);

	const headers: Record<string, string> = {
		"x-auth": authHeader,
		"Content-Type": "application/json",
	};

	const res = await fetch(`${URL}/${endpoint}`, {
		method: "POST",
		headers,
		body: bodyBytes.length > 0 ? new TextDecoder().decode(bodyBytes) : undefined,
	});

	expect(res.status).toBe(200);
	return await res.text();
}
