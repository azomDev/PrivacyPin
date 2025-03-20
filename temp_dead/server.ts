import * as RH from "./request-handler";
import type { FriendRequest, Ping, SignData } from "./models";
import { initServer, isAdmin, isSignatureValid } from "./utils";
import { handlers } from "./test";

await initServer();

const server = Bun.serve({
	port: 8080,
	async fetch(req) {
		const test = await handlers["create-friend-request"]({ sender_id: "123", accepter_id: "456" }, { sign_data: { user_id: "123" } });

		const url = new URL(req.url);
		const endpoint = url.pathname;
		const req_content = await req.text();
		console.log(req_content);

		// ONLY TEMPORARY WAY OF GENERATING SIGNUP KEYS FOR TESTING UNTIL IT IS IMPLEMENTED IN THE FRONTEND
		if (endpoint === "/generate-signup-key") {
			const new_signup_key = RH.generateSignupKey();
			return new Response(new_signup_key);
		}

		if (endpoint === "/challenge") {
			const challenge = RH.challenge(req_content);
			return new Response(challenge); // in case of the /challenge endpoint, the body is directly the user_id as a string
		} else if (endpoint === "/create-account") {
			const { signup_key, pub_sign_key } = JSON.parse(req_content) as {
				signup_key: string;
				pub_sign_key: string;
			};
			const user_id = RH.createAccount(signup_key, pub_sign_key);
			return new Response(user_id);
		}

		////////////////////////////////

		const sign_data_header = req.headers.get("sign-data");
		if (sign_data_header === null) throw new Error("todo");
		console.log(sign_data_header);
		const header_data = JSON.parse(sign_data_header) as {
			signature: string;
			user_id: string;
		};
		const sign_data: SignData = {
			signature: Uint8Array.fromBase64(header_data.signature),
			user_id: header_data.user_id,
		};

		if (!(await isSignatureValid(req_content, sign_data))) {
			throw new Error("Invalid signature");
		}

		if (endpoint === "/generate-signup-key") {
			if (!(await isAdmin(sign_data.user_id))) throw new Error("User must be an admin to generate a signup key");
			const signup_key = RH.generateSignupKey();
			return new Response(signup_key);
		} else if (endpoint === "/create-friend-request") {
			const friend_request = JSON.parse(req_content) as FriendRequest;
			if (friend_request.sender_id !== sign_data.user_id)
				throw new Error("Sender ID mismatch: You can only create friend requests from your own account");
			RH.createFriendRequest(friend_request);
			return new Response();
		} else if (endpoint === "/accept-friend-request") {
			const friend_request = JSON.parse(req_content) as FriendRequest;
			if (friend_request.accepter_id !== sign_data.user_id)
				throw new Error("Accepter ID mismatch: You can only accept friend requests addressed to you");
			RH.acceptFriendRequest(friend_request);
			return new Response();
		} else if (endpoint === "/send-pings") {
			console.log(req_content);
			const pings = JSON.parse(req_content) as Ping[];
			if (pings.some((ping) => ping.sender_id !== sign_data.user_id))
				throw new Error("Sender ID mismatch: You can only send pings from your own account");
			RH.sendPings(pings);
			return new Response();
		} else if (endpoint === "/get-pings") {
			const { sender_id, receiver_id } = JSON.parse(req_content) as {
				sender_id: string;
				receiver_id: string;
			};
			if (receiver_id !== sign_data.user_id) throw new Error("Access denied: You can only retrieve pings addressed to you");
			const pings = RH.getPings(sender_id, receiver_id);
			return Response.json(pings);
		} else if (endpoint === "/is-friend-request-accepted") {
			const friend_request = JSON.parse(req_content) as FriendRequest;
			if (friend_request.sender_id !== sign_data.user_id)
				throw new Error("Sender ID mismatch: You can only check the status of friend requests you sent");
			const is_accepted = RH.isFriendRequestAccepted(friend_request);
			return new Response(is_accepted.toString());
		}
		throw new Error("Not found");
	},
	error(err: Error) {
		console.error(err);
		return new Response(err.message, {
			status: 500,
		});
	},
});

console.log(`Server started on port ${server.port}`);
