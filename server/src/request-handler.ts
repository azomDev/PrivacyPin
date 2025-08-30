import { randomUUIDv7 } from "bun";
import * as db from "./database";
import type {
	CreateAccountRequest,
	GlobalFriendRequest as FriendRequest,
	ServerPing,
	ServerUser,
} from "@privacypin/shared";
import { CONFIG } from "./config";
import { CyclicExpiryQueue } from "./cyclic-expiry-queue";
import { Err, friend_request_queue, genID, signup_key_queue } from "./utils";

export function createAccount(req: { signup_key: string }): { user_id: string; is_admin: boolean } {
	if (!signup_key_queue.consume(req.signup_key)) {
		throw new Err("Invalid signup key", true);
	}
	const user_id = genID();
	let is_admin = false;
	if (db.noUsers()) {
		// Admin creating an account
		Bun.file(CONFIG.ADMIN_ID_PATH).write(user_id);
		is_admin = true;
	}
	db.createUser(user_id);
	return { user_id, is_admin };
}

export function generateSignupKey(): { signup_key: string } {
	const signup_key = genID();
	signup_key_queue.add(signup_key);

	return { signup_key };
}

export function createFriendRequest(friend_request: { sender_id: string; accepter_id: string }) {
	const { sender_id, accepter_id } = friend_request;

	if (sender_id === accepter_id) {
		throw new Err("You can't send a friend request to yourself");
	}

	if (db.linkExists(sender_id, accepter_id)) {
		throw new Err("You are already friends");
	}

	friend_request_queue.add(friend_request);
}

export function acceptFriendRequest(friend_request: { sender_id: string; accepter_id: string }) {
	const { sender_id, accepter_id } = friend_request;

	if (!friend_request_queue.consume(friend_request)) {
		throw new Err("No friend request found");
	}

	db.createLink(sender_id, accepter_id);
}

export function sendPings(
	pings: {
		sender_id: string;
		receiver_id: string;
		encrypted_ping: string;
	}[],
) {
	// TODO: check that a link exists between the users
	db.addPings(pings);
}

export function getPings(data: { sender_id: string; receiver_id: string }): { pings: string[] } {
	let { sender_id, receiver_id } = data;
	if (!db.linkExists(sender_id, receiver_id)) {
		throw new Err("No link found", true);
	}

	const pings = db.getPings(sender_id, receiver_id);
	if (pings === null) {
		throw new Err("No pings found");
	}
	return { pings };
}

export function isFriendRequestAccepted(friend_request: {
	sender_id: string;
	accepter_id: string;
}): { accepted: boolean } {
	const accepted = db.linkExists(friend_request.sender_id, friend_request.accepter_id);
	return { accepted };
}
