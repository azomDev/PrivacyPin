import { RequestHandler as RH } from "./request-handler";
import { type FriendRequest, type Ping, type SignData } from "./models";
import { initServer, isAdmin, isSignatureValid } from "./utils";

await initServer();

const server = Bun.serve({
	port: 8080,
	async fetch(req) {
		const url = new URL(req.url);
		const endpoint = url.pathname;
		const req_content = await req.text();

		if (endpoint === "/challenge") {
			return RH.challenge(req_content); // in case of the /challenge endpoint, the body is directly the user_id as a string
		} else if (endpoint === "/create-account") {
			const { signup_key, pub_sign_key } = JSON.parse(req_content) as { signup_key: string; pub_sign_key: Uint8Array };
			return RH.createAccount(signup_key, pub_sign_key);
		}

		////////////////////////////////

		const sign_data_header = req.headers.get("sign-data");
		if (sign_data_header === null) return new Response("todo", { status: 599 });
		const sign_data = JSON.parse(sign_data_header) as SignData;

		if (!(await isSignatureValid(req_content, sign_data))) {
			return new Response("todo", { status: 599 });
		}

		if (endpoint === "/generate-signup-key") {
			if (!(await isAdmin(sign_data.user_id))) return new Response("todo", { status: 599 });
			return RH.generateSignupKey();
		} else if (endpoint === "/create-friend-request") {
			const friend_request = JSON.parse(req_content) as FriendRequest;
			if (friend_request.sender_id !== sign_data.user_id) return new Response("todo", { status: 599 });
			return RH.createFriendRequest(friend_request);
		} else if (endpoint === "/accept-friend-request") {
			const friend_request = JSON.parse(req_content) as FriendRequest;
			if (friend_request.accepter_id !== sign_data.user_id) return new Response("todo", { status: 599 });
			return RH.acceptFriendRequest(friend_request);
		} else if (endpoint === "/send-ping") {
			const ping = JSON.parse(req_content) as Ping;
			if (ping.sender_id !== sign_data.user_id) return new Response("todo", { status: 599 });
			return RH.sendPing(ping);
		} else if (endpoint === "/get-pings") {
			const { sender_id, receiver_id } = JSON.parse(req_content) as { sender_id: string; receiver_id: string };
			if (receiver_id !== sign_data.user_id) return new Response("todo", { status: 599 });
			return RH.getPings(sender_id, receiver_id);
		}
		return new Response("Not found", { status: 404 });
	},
});

console.log(`Server started on port ${server.port}`);
