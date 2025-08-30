import { Store } from "./store";
import type { Base64String, GlobalSignData as SignData } from "@privacypin/shared";
import { fetch } from "@tauri-apps/plugin-http"; // todo is this needed for mobile?
import z from "zod";

Uint8Array.prototype.toBase64 = function () {
	let binary = "";
	for (let i = 0; i < this.length; i++) {
		const byte = this[i];
		if (byte !== undefined) {
			binary += String.fromCharCode(byte);
		}
	}
	return btoa(binary);
};

export async function createAccount(data: {
	signup_key: string;
}): Promise<{ user_id: string; is_admin: boolean }> {
	try {
		const server_url = await Store.get("server_url");
		let body = {
			data: JSON.stringify(data),
		};

		const response = await fetch(server_url + "/create-account", {
			method: "POST",
			body: JSON.stringify(body),
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

export async function generateSignupKey(): Promise<{ signup_key: string }> {
	try {
		const server_url = await Store.get("server_url");
		const user_id = await Store.get("user_id");
		let body = {
			auth: { user_id },
		};

		const response = await fetch(server_url + "/generate-signup-key", {
			method: "POST",
			body: JSON.stringify(body),
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

export async function createFriendRequest(data: {
	sender_id: string;
	accepter_id: string;
}): Promise<any> {
	try {
		const server_url = await Store.get("server_url");
		const user_id = await Store.get("user_id");
		let body = {
			data: JSON.stringify(data),
			auth: { user_id },
		};

		const response = await fetch(server_url + "/create-friend-request", {
			method: "POST",
			body: JSON.stringify(body),
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

export async function acceptFriendRequest(data: {
	sender_id: string;
	accepter_id: string;
}): Promise<any> {
	try {
		const server_url = await Store.get("server_url");
		const user_id = await Store.get("user_id");
		let body = {
			data: JSON.stringify(data),
			auth: { user_id },
		};

		const response = await fetch(server_url + "/accept-friend-request", {
			method: "POST",
			body: JSON.stringify(body),
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

export async function isFriendRequestAccepted(data: {
	sender_id: string;
	accepter_id: string;
}): Promise<{ accepted: boolean }> {
	try {
		const server_url = await Store.get("server_url");
		const user_id = await Store.get("user_id");
		let body = {
			data: JSON.stringify(data),
			auth: { user_id },
		};

		const response = await fetch(server_url + "/is-friend-request-accepted", {
			method: "POST",
			body: JSON.stringify(body),
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

export async function sendPings(
	data: {
		sender_id: string;
		receiver_id: string;
		encrypted_ping: string;
	}[],
): Promise<any> {
	try {
		const server_url = await Store.get("server_url");
		const user_id = await Store.get("user_id");
		let body = {
			data: JSON.stringify(data),
			auth: { user_id },
		};

		const response = await fetch(server_url + "/send-pings", {
			method: "POST",
			body: JSON.stringify(body),
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

export async function getPings(data: {
	sender_id: string;
	receiver_id: string;
}): Promise<{ pings: string[] }> {
	try {
		const server_url = await Store.get("server_url");
		const user_id = await Store.get("user_id");
		let body = {
			data: JSON.stringify(data),
			auth: { user_id },
		};

		const response = await fetch(server_url + "/get-pings", {
			method: "POST",
			body: JSON.stringify(body),
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
