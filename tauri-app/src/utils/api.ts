import { Store } from "./store";
import { APIRoutes, CreateAccountPayload, CreateAccountPayload } from "../../../shared/apiTypes";
import type { GlobalSignData as SignData } from "../../../shared/globalTypes";
import { getBufferForSignature } from "../../../shared/utils";
import { fetch } from "@tauri-apps/plugin-http";

async function getChallengeHeaders(data: any): Promise<HeadersInit> {
	const user_id = await Store.get("user_id");
	const nonce = new Uint8Array(32);
	crypto.getRandomValues(nonce);
	const nonce_string = nonce.toBase64();
	const timestamp = Date.now();

	const private_key = await Store.get("private_key");
	const imported_private_key = await crypto.subtle.importKey("jwk", private_key!, "Ed25519", false, ["sign"]);
	const string_timestamp = timestamp.toString();
	const string_data = JSON.stringify(data);
	const buffer_to_sign = getBufferForSignature(string_data, nonce_string, string_timestamp, user_id!);
	const signature = await crypto.subtle.sign("Ed25519", imported_private_key, buffer_to_sign);
	const temp = new Uint8Array(signature);
	const signature_string = temp.toBase64();

	const sign_data: SignData = {
		user_id: user_id!,
		nonce: nonce_string,
		signature: signature_string,
		timestamp: string_timestamp,
	};

	return { "sign-data": JSON.stringify(sign_data) };
}

export async function apiRequest<K extends keyof APIRoutes>(endpoint: K, data: APIRoutes[K]["input"]): Promise<APIRoutes[K]["output"]> {
	let headers: HeadersInit | undefined;
	const server_url = await Store.get("server_url");

	// todo put create account back here

	headers = await getChallengeHeaders(data); // headers is not ok

	const response = await fetch(`${server_url}${endpoint}`, {
		method: "POST",
		headers,
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error(`API request failed: ${response.statusText}`);
	}

	return response.json() as Promise<APIRoutes[K]["output"]>;
}

export async function createAccount(server_url: string, data: CreateAccountPayload): Promise<CreateAccountPayload> {
	const response = await fetch(`${server_url}/create-account`, {
		method: "POST",
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error(`API request failed: ${response.statusText}`);
	}

	return (await response.json()) as CreateAccountPayload;
}
