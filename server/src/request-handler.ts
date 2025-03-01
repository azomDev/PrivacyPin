import { randomUUIDv7 } from "bun";
import * as db from "./database";
import {
	type Challenge,
	type FriendRequest,
	type Ping,
	type User,
} from "./models";
import { Challenges } from "./utils";

export function challenge(user_id: string): string {
	const nonce = new Uint8Array(16);
	crypto.getRandomValues(nonce);
	const timestamp = Date.now();
	const challenge: Challenge = { nonce: nonce.toBase64(), timestamp };
	Challenges.set(user_id, challenge);

	setTimeout(() => Challenges.delete(user_id), 1 * 60 * 1000); // after 1 min, clean the challenge so timestamp is not kept for privacy reasons
	return user_id + challenge.nonce + challenge.timestamp;
}

export function createAccount(
	signup_key: string,
	pub_sign_key: string,
): string {
	if (!db.consumeSignupKey(signup_key)) {
		throw new Error("Invalid signup key");
	}
	const user_id = randomUUIDv7();
	if (db.noUsers()) Bun.file("admin_id.txt").write(user_id); // Admin creating an account
	const user: User = { user_id, pub_sign_key };
	db.createUser(user);
	return user_id;
}

export function generateSignupKey(): string {
	const new_signup_key = randomUUIDv7();
	db.insertSignupKey(new_signup_key);
	return new_signup_key;
}

// todo when sending a friend request, do the timer thing to delete all of them after x amount of time that resets each time?
export function createFriendRequest(friend_request: FriendRequest) {
	const { sender_id, accepter_id } = friend_request;

	if (sender_id === accepter_id) {
		throw new Error("You can't send a friend request to yourself");
	}

	if (db.linkExists(sender_id, accepter_id)) {
		throw new Error("You are already friends");
	}

	db.createFriendRequest(sender_id, accepter_id);

	return;
}

export function acceptFriendRequest(friend_request: FriendRequest) {
	const { sender_id, accepter_id } = friend_request;

	if (!db.consumeFriendRequest(sender_id, accepter_id)) {
		throw new Error("No friend request found");
	}
	db.createLink(sender_id, accepter_id);
	return;
}

export function sendPings(pings: Ping[]) {
	db.addPings(pings);
	return;
}

export function getPings(sender_id: string, receiver_id: string): string[] {
	// check if a link exists between the two users
	if (!db.linkExists(sender_id, receiver_id)) {
		throw new Error("No link found");
	}

	const pings = db.getPings(sender_id, receiver_id);
	if (pings === null) {
		throw new Error("No pings found");
	}
	return pings;
}

export function isFriendRequestAccepted(
	friend_request: FriendRequest,
): boolean {
	const { sender_id, accepter_id } = friend_request;
	return db.linkExists(sender_id, accepter_id);
}
