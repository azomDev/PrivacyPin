import { CONFIG } from "./config.ts";
import * as RH from "./request-handler";
import { initServer } from "./request-handler";
import { getLocalIp } from "./dev.ts";
import { Err } from "./utils.ts";
import z from "zod";

await initServer();
console.log(`Server running at http://${getLocalIp()}:${CONFIG.PORT}`);

export async function isAdmin(user_id: string): Promise<boolean> {
	const admin_file = Bun.file(CONFIG.ADMIN_ID_PATH);
	const admin_id = await admin_file.text();
	return user_id === admin_id;
}

Bun.serve({
	port: CONFIG.PORT,
	async fetch(req) {
		return await idkyet(req);
	},
	error(e: Error) {
		if (e instanceof Err) {
			if (e.log_server) {
				console.error(e);
			}
			return new Response(JSON.stringify({ message: e.message, code: e.error_code }), { status: 599 });
		} else {
			throw new Error(e.message); // if this throws, there's an unhandled error
		}
	},
});

async function idkyet(req: Request) {
	console.log(req);
	const url = new URL(req.url);

	const req_body = await req.text();
	const req_json = JSON.parse(req_body);

	let res = undefined;

	const FriendRequestZod = z.object({
		sender_id: z.string(),
		accepter_id: z.string(),
	});

	const ServerPingZod = z.object({
		sender_id: z.string(),
		receiver_id: z.string(),
		encrypted_ping: z.string(),
	});

	const CreateAccountZod = z.object({
		signup_key: z.string(),
	});

	const IDKZod = z.object({
		sender_id: z.string(),
		receiver_id: z.string(),
	});

	try {
		if (url.pathname === "/create-account") {
			const { signup_key } = CreateAccountZod.parse(req_json);
			res = RH.createAccount(signup_key);
		} else if (url.pathname === "/generate-signup-key") {
			res = RH.generateSignupKey();
		} else if (url.pathname === "/create-friend-request") {
			const friend_request = FriendRequestZod.parse(req_json);
			RH.createFriendRequest(friend_request);
		} else if (url.pathname === "/accept-friend-request") {
			const friend_request = FriendRequestZod.parse(req_json);
			RH.acceptFriendRequest(friend_request);
		} else if (url.pathname === "/is-friend-request-accepted") {
			const friend_request = FriendRequestZod.parse(req_json);
			res =  RH.isFriendRequestAccepted(friend_request);
		} else if (url.pathname === "/send-pings") {
			const pings = z.array(ServerPingZod).parse(req_json);
			RH.sendPings(pings);
		} else if (url.pathname === "/get-pings") {
			const { sender_id, receiver_id } = IDKZod.parse(req_json);
			res = RH.getPings(sender_id, receiver_id);
		} else {
			throw new Err("Not found", true);
		}
	} catch (e: unknown) {
		// todo
	}

	console.log(res);
	if (res === undefined) {
		return Response.json({});
	}
	return Response.json(res);
}
