import { Store } from "./store";
import type { Base64String, GlobalSignData as SignData } from "@privacypin/shared";
import { routes, RouteDef } from "../../../server/src/server"; // TODO: We should not import things from the server files
import { fetch } from "@tauri-apps/plugin-http"; // todo is this needed for mobile?
import z from "zod";

Uint8Array.prototype.toBase64 = function () {
	let binary = '';
	for (let i = 0; i < this.length; i++) {
		const byte = this[i];
		if (byte !== undefined) {
			binary += String.fromCharCode(byte);
		}
	}
	return btoa(binary);
};

export async function apiRequest<E extends keyof typeof routes>(
	endpoint: E,
	body: z.infer<(typeof routes)[E]["request_schema"]>
): Promise<z.infer<(typeof routes)[E]["response_schema"]>> {
	try {
		const data = JSON.stringify(body);

		let auth: string | undefined;

		if (routes[endpoint].auth_required) {
			const user_id = await Store.get("user_id");
			auth = JSON.stringify({ user_id });
		}

		const server_url = await Store.get("server_url");

		let body2;
		if (auth === undefined) {
			body2 = { data };
		} else {
			body2 = { auth, data };
		}

		const response = await fetch(server_url + endpoint, {
			method: "POST",
			body: JSON.stringify(body2),
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
