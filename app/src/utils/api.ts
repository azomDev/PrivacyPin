import { Store } from "./store.ts";

function bufToBase64(buf: ArrayBuffer): string {
	return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function strToBytes(str: string): Uint8Array {
	return new TextEncoder().encode(str);
}

export async function createAccount(server_url: string, signup_key: string): Promise<{ user_id: string; is_admin: boolean }> {
	try {
		await Store.set("server_url", server_url);
		const keyPair = await crypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]);
		const pubKeyRaw = await crypto.subtle.exportKey("raw", keyPair.publicKey);
		const privKeyRaw = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
		const pub_key_b64 = bufToBase64(pubKeyRaw);

		const response = await fetch(server_url + "/create-account", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ signup_key, pub_key_b64 }),
		});

		if (!response.ok) throw new Error(await response.text());
		const json = await response.json();

		await Store.set("user_id", json.user_id);
		await Store.set("priv_key", bufToBase64(privKeyRaw));

		return json;
	} catch (err) {
		alert(`${err}`);
		throw err;
	}
}

export async function post(endpoint: string, data: object | string | undefined): Promise<any> {
	try {
		const user_id = await Store.get("user_id");
		const server_url = await Store.get("server_url");
		console.log(`Exhibit B: ${server_url}`);
		const privKey_b64 = await Store.get("priv_key");

		if (!user_id || !privKey_b64) throw new Error("Missing user credentials");

		// Prepare request body bytes
		let bodyStr = "";
		if (typeof data === "object") bodyStr = JSON.stringify(data);
		else if (typeof data === "string") bodyStr = data;
		const bodyBytes = strToBytes(bodyStr);

		// Import private key and sign
		const privKeyBytes = Uint8Array.from(atob(privKey_b64), (c) => c.charCodeAt(0));

		const privKey = await crypto.subtle.importKey("pkcs8", privKeyBytes.buffer, { name: "Ed25519" }, false, ["sign"]);

		const signature = await crypto.subtle.sign("Ed25519", privKey, bodyBytes);
		const signature_b64 = bufToBase64(signature);

		// Encode header JSON to base64
		const authJson = JSON.stringify({ user_id, signature: signature_b64 });
		const authHeader = btoa(authJson);

		const headers: Record<string, string> = {
			"x-auth": authHeader,
		};
		if (typeof data === "object") headers["Content-Type"] = "application/json";

		const res = await fetch(`${server_url}/${endpoint}`, {
			method: "POST",
			headers,
			body: bodyStr.length > 0 ? bodyStr : undefined,
		});

		if (!res.ok) throw new Error(await res.text());
		return await res.text();
	} catch (err) {
		alert(`${err}`);
		throw err;
	}
}
