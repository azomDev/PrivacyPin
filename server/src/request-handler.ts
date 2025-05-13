import { randomUUIDv7 } from "bun";
import * as db from "./database";
import type { GlobalFriendRequest as FriendRequest, ServerPing, ServerUser } from "@privacypin/shared";
import { CONFIG } from "./config";
import { CyclicExpiryQueue } from "./cyclic-expiry-queue";

const signup_key_queue = new CyclicExpiryQueue<string>(24 * 60 * 60 * 1000); // 1 day
const friend_request_queue = new CyclicExpiryQueue<FriendRequest>(24 * 60 * 60 * 1000); // 1 day

export function createAccount(signup_key: string, pub_sign_key: JsonWebKey): { user_id: string; is_admin: boolean } {
	if (!signup_key_queue.consume(signup_key)) {
		throw new Error("Invalid signup key");
	}
	// temporary smaller id for testing
	const user_id = Math.random().toString(36).slice(2, 8);
	// const user_id = randomUUIDv7();
	let is_admin = false;
	if (db.noUsers()) {
		// Admin creating an account
		Bun.file(CONFIG.ADMIN_ID_PATH).write(user_id);
		is_admin = true;
	}
	const user: ServerUser = { user_id, pub_sign_key: JSON.stringify(pub_sign_key) };
	db.createUser(user);
	return { user_id, is_admin };
}

export function generateSignupKey(): { signup_key: string } {
	// temporary smaller id for testing
	const signup_key = Math.random().toString(36).slice(2, 8);
	// const signup_key = randomUUIDv7();
	signup_key_queue.add(signup_key);

	return { signup_key };
}

// TODO: when do we delete friend requests if they are unused?
export function createFriendRequest(friend_request: FriendRequest) {
	const { sender_id, accepter_id } = friend_request;

	if (sender_id === accepter_id) {
		throw new Error("You can't send a friend request to yourself");
	}

	if (db.linkExists(sender_id, accepter_id)) {
		throw new Error("You are already friends");
	}

	friend_request_queue.add(friend_request);
}

export function acceptFriendRequest(friend_request: FriendRequest) {
	const { sender_id, accepter_id } = friend_request;

	if (!friend_request_queue.consume(friend_request)) {
		throw new Error("No friend request found"); // todo this should not throw an error?
	}
	db.createLink(sender_id, accepter_id);
}

export function sendPings(pings: ServerPing[]) {
	// todo check that a link exists between the users
	db.addPings(pings);
}

export function getPings(sender_id: string, receiver_id: string): { pings: string[] } {
	if (!db.linkExists(sender_id, receiver_id)) {
		throw new Error("No link found");
	}

	const pings = db.getPings(sender_id, receiver_id);
	if (pings === null) {
		throw new Error("No pings found");
	}
	return { pings };
}

export function isFriendRequestAccepted(friend_request: FriendRequest): { accepted: boolean } {
	const accepted = db.linkExists(friend_request.sender_id, friend_request.accepter_id);
	return { accepted };
}
