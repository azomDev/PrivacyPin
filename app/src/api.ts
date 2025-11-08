import { Store } from "./store.ts";

// TODO: test if this is still needed:
// Don't mind this piece of code, it's a polyfill until chromium decides to merge it (it's been so long)
// @ts-ignore
// Uint8Array.prototype.toBase64 = function () {
// 	let binary = "";
// 	for (let i = 0; i < this.length; i++) {
// 		const byte = this[i];
// 		if (byte !== undefined) {
// 			binary += String.fromCharCode(byte);
// 		}
// 	}
// 	return btoa(binary);
// };

export async function createAccount(signup_key: string): Promise<{ user_id: string; is_admin: boolean }> {
	try {
		const server_url = await Store.get("server_url");

		const response = await fetch(server_url + "/create-account", {
			method: "POST",
			body: signup_key,
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

export async function post(endpoint: string, data: Object | string | undefined): Promise<any> {
	try {
		const user_id = await Store.get("user_id");
		const server_url = await Store.get("server_url");

		const headers: Record<string, string> = {
			"x-auth": JSON.stringify({ user_id }),
		};

		let stringified_data: string | undefined;

		if (typeof data === "object") {
			stringified_data = JSON.stringify(data);
			headers["Content-Type"] = "application/json";
		} else {
			stringified_data = data;
		}

		const res = await fetch(`${server_url}/${endpoint}`, {
			method: "POST",
			headers,
			body: stringified_data,
		});

		if (!res.ok) {
			throw new Error(`${await res.text()}`);
		}

		return await res.text();
	} catch (err) {
		alert(`${err}`);
		throw err;
	}
}
