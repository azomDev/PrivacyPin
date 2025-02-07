import { acceptFriendRequest, createAccount, createFriendRequest, generateSignupKey, getPing, sendPing } from "./httpAPI";
import type { FriendRequest, Ping } from "./models";

const server = Bun.serve({
	port: 8080,
	async fetch(req) {
		const url = new URL(req.url);
		const endpoint = url.pathname;
		if (endpoint === "/create-account") {
			const { signup_key, pub_sign_key } = (await req.json()) as { signup_key: string; pub_sign_key: string };
			return createAccount(signup_key, pub_sign_key);
		} else if (endpoint === "/generate-signup-key") {
			return generateSignupKey();
		} else if (endpoint === "/create-friend-request") {
			const friend_request = (await req.json()) as FriendRequest;
			return createFriendRequest(friend_request);
		} else if (endpoint === "/accept-friend-request") {
			const friend_request = (await req.json()) as FriendRequest;
			return acceptFriendRequest(friend_request);
		} else if (endpoint === "/send-ping") {
			const ping = (await req.json()) as Ping;
			return sendPing(ping);
		} else if (endpoint === "/get-ping") {
			const { sender_id, receiver_id } = (await req.json()) as { sender_id: string; receiver_id: string };
			return getPing(sender_id, receiver_id);
		} else if (endpoint === "/delete-account") {
			// todo
		}
		return new Response("Not found", { status: 404 });
	},
});

console.log(`Server started on port ${server.port}`);

// for other servers, we need:
// - a way to create a user account as a visitor (meaning they only want to fetch pings). No need for a signup key for this since we don't need to prevent spam as a visitor can only fetch pings and already needs to be "reffered" by another user, meaning that the other user on that server must say to the server that it's ok that the visitor creates an account.
// so basically the create account for a visitor will be when people adds themselves as friends from different servers. If they are already a visitor of the other's server, no need to create an account, just link the two users.
// - a way to fetch pings as a visitor
// - a way to send, accept friend requests and create links between visitor and user (never between two visitors)
