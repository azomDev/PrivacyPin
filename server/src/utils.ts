import { randomUUIDv7 } from "bun";
import { CONFIG } from "./config";
import { CyclicExpiryQueue } from "./cyclic-expiry-queue";
import type { GlobalFriendRequest as FriendRequest } from "@privacypin/shared";

export class Err extends Error {
	public log_server: boolean;
	public error_code: number;

	constructor(message: string, log_server: boolean = false, error_code: number = 599) {
		super(message);
		this.name = "Err";
		this.log_server = log_server;
		this.error_code = error_code;
	}
}

export async function isAdmin(user_id: string): Promise<boolean> {
	const admin_file = Bun.file(CONFIG.ADMIN_ID_PATH);
	const admin_id = await admin_file.text();
	return user_id === admin_id;
}

export function genID(): string {
	return Math.random().toString(36).slice(2, 8); // smaller id for dev
	// return randomUUIDv7();
}

export const signup_key_queue = new CyclicExpiryQueue<string>(24 * 60 * 60 * 1000); // 1 day
export const friend_request_queue = new CyclicExpiryQueue<FriendRequest>(24 * 60 * 60 * 1000); // 1 day


export async function initServer() {
	const admin_file = Bun.file(CONFIG.ADMIN_ID_PATH);
	if (await admin_file.exists()) return; // No need to init the server
	signup_key_queue.clear();
	const new_signup_key = genID();
	signup_key_queue.add(new_signup_key);
	console.log(`Admin signup key: ${new_signup_key}`);
}
