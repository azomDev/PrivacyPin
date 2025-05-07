import { Store } from "./store";
import { APIRoutesRuntime, type APIRoutes } from "@privacypin/shared";
import type { Base64String, GlobalSignData as SignData } from "@privacypin/shared";
import { getBufferForSignature } from "@privacypin/shared";

import { fetch } from "@tauri-apps/plugin-http"; // todo is this needed?

export async function apiRequest<K extends keyof APIRoutes>(endpoint: K, body: APIRoutes[K]["input"]): Promise<APIRoutes[K]["output"]> {
	try {
		const data_string = JSON.stringify(body);

		let headers: HeadersInit | undefined;
		if (APIRoutesRuntime[endpoint].auth) {
			headers = await getChallengeHeader(data_string);
		}

		const server_url = await Store.get("server_url");

		const response = await fetch(server_url + endpoint, {
			method: "POST",
			body: data_string,
			headers,
		});

		if (!response.ok) {
			throw new Error(`${await response.text()}`);
		}
		return await response.json();
	} catch (err) {
		alert(`${err}`);
		throw err;
	}
}

async function getChallengeHeader(data: string): Promise<HeadersInit> {
	const user_id = await Store.get("user_id");
	const timestamp = Date.now().toString();

	const nonce = new Uint8Array(32);
	crypto.getRandomValues(nonce);
	const nonce_string: Base64String = nonce.toBase64();
	const private_key = await Store.get("private_key");
	const imported_private_key = await crypto.subtle.importKey("jwk", private_key!, "Ed25519", false, ["sign"]);

	const buffer_to_sign = getBufferForSignature(data, nonce_string, timestamp, user_id!);
	const signature = await crypto.subtle.sign("Ed25519", imported_private_key, buffer_to_sign);
	const signature_string: Base64String = new Uint8Array(signature).toBase64();

	const sign_data: SignData = {
		user_id: user_id!,
		nonce: nonce_string,
		signature: signature_string,
		timestamp: timestamp,
	};

	return { "sign-data": JSON.stringify(sign_data) }; // todo x-sign-data
}
