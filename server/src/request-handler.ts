import { randomUUIDv7 } from "bun";
import * as db from "./database";
import type { Challenge, FriendRequest, Ping, User } from "./models";
import { Challenges } from "./utils";

export function challenge(user_id: string) {
	const nonce = randomUUIDv7();
	const timestamp = Date.now();
	const challenge: Challenge = { nonce, timestamp };
	Challenges.set(user_id, challenge);

	setTimeout(() => Challenges.delete(user_id), 1 * 60 * 1000); // after 1 min, clean the challenge so timestamp is not kept for privacy reasons
	return new Response(user_id + challenge.nonce + challenge.timestamp);
}

export function createAccount(signup_key: string, pub_sign_key: Uint8Array): Response {
	if (!db.consumeSignupKey(signup_key)) {
		return new Response("Invalid signup key", { status: 599 });
	}

	const user_id = randomUUIDv7();
	if (db.noUsers()) Bun.file("admin_id.txt").write(user_id); // Admin creating an account
	const user: User = { user_id, pub_sign_key };
	db.createUser(user);
	return new Response(user_id);
}

export function generateSignupKey(): Response {
	const new_signup_key = randomUUIDv7();
	db.insertSignupKey(new_signup_key);

	return new Response(new_signup_key);
}

// todo when sending a friend request, do the timer thing to delete all of them after x amount of time that resets each time?
export function createFriendRequest(friend_request: FriendRequest): Response {
	const { sender_id, accepter_id } = friend_request;

	if (sender_id === accepter_id) {
		console.log("test");
		return new Response("Sender and accepter cannot be the same user", { status: 599 });
	}

	if (db.linkExists(sender_id, accepter_id)) {
		return new Response("todo", { status: 599 });
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

export function sendPings(pings: Ping[]): Response {
	db.addPings(pings);
	return new Response();
}

export function getPings(sender_id: string, receiver_id: string): Response {
	// check if a link exists between the two users
	if (!db.linkExists(sender_id, receiver_id)) {
		return new Response("No link found", { status: 599 });
	}

	const pings = db.getPings(sender_id, receiver_id);
	if (pings === null) {
		return new Response("No pings found", { status: 599 });
	}
	return Response.json(pings);
}

export function isFriendRequestAccepted(friend_request: FriendRequest): Response {
	const { sender_id, accepter_id } = friend_request;
	if (db.linkExists(sender_id, accepter_id)) {
		return new Response("true");
	}
	return new Response("false");
}
