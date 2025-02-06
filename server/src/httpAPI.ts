import { randomUUIDv7 } from "bun";
import { ServerDatabase as db } from "./db";
import type { FriendRequest, Ping, User } from "./models";

export function createAccount(signup_key: string, pub_sign_key: string): Response {
	if (!db.consumeSignupKey(signup_key)) {
		return new Response("Invalid signup key", { status: 599 });
	}
	const user_id = randomUUIDv7();
	const user: User = { user_id, pub_sign_key, last_action_timestamp: Date.now() };
	db.createUser(user);
	return new Response(user_id);
}

export function generateSignupKey(): Response {
	const new_signup_key = randomUUIDv7();
	db.insertSignupKey(new_signup_key);

	return new Response(new_signup_key);
}

export function createFriendRequest(friend_request: FriendRequest): Response {
	const { sender_id, accepter_id } = friend_request;
	if (sender_id === accepter_id) {
		return new Response("Sender and accepter cannot be the same user", { status: 599 });
	}
	db.createFriendRequest(sender_id, accepter_id);
	return new Response();
}

export function acceptFriendRequest(friend_request: FriendRequest): Response {
	const { sender_id, accepter_id } = friend_request;

	if (!db.consumeFriendRequest(sender_id, accepter_id)) {
		return new Response("There was no friend request to accept", { status: 599 });
	}
	db.createLink(sender_id, accepter_id);
	return new Response();
}

export function sendPing(ping: Ping): Response {
	db.addPing(ping);
	return new Response();
}

export function getPing(sender_id: string, receiver_id: string): Response {
	// check if a link exists between the two users
	if (!db.linkExists(sender_id, receiver_id)) {
		return new Response("No link found", { status: 599 });
	}

	const ping = db.getPing(sender_id, receiver_id);
	if (!ping) {
		return new Response("No ping found", { status: 599 });
	}
	return Response.json(ping);
}
