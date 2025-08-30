import { CONFIG } from "./config.ts";
import * as RH from "./request-handler";
import { getLocalIp } from "./dev.ts";
import { Err, initServer, isAdmin } from "./utils.ts";

await initServer();
console.log(`Server running at http://${getLocalIp()}:${CONFIG.PORT}`);

Bun.serve({
	port: CONFIG.PORT,
	async fetch(req) {
		return await handleridk(req);
	},
	error(e: Error) {
		if (e instanceof Err) {
			if (e.log_server) {
				console.error(e);
			}
			return new Response(JSON.stringify({ message: e.message, code: e.error_code }), {
				status: 599,
			});
		} else {
			throw e; // if this throws, there's an unhandled error
		}
	},
});

// REQUEST
// {
//     auth?: {
//         user_id: string,
//         signature: base64 string,
//         next_pkey: JsonWebKey
//     },
//     data?: string (representing JSON)
// }

async function handleridk(req: Request) {
	const emoji = "📦";
	const boxWidth = 60;
	const border = "═".repeat(boxWidth);
	const megaBorder = "█".repeat(boxWidth);

	const url = new URL(req.url);
	const pathname = url.pathname;

	console.log("\n" + megaBorder);
	console.log(`${emoji}  Request: ${pathname}`);
	console.log("─".repeat(boxWidth));
	console.log("📥 Input:");

	const body = await req.json();
	const data = body.data === undefined ? undefined : JSON.parse(body.data);

	console.log(JSON.stringify(body, null, 2));
	console.log("─".repeat(boxWidth));
	console.log("⚙️ Processing:");

	let res;

	if (pathname === "/create-account") {
		res = RH.createAccount(data);
	} else if (pathname === "/generate-signup-key") {
		res = RH.generateSignupKey();
	} else if (pathname === "/create-friend-request") {
		res = RH.createFriendRequest(data);
	} else if (pathname === "/accept-friend-request") {
		res = RH.acceptFriendRequest(data);
	} else if (pathname === "/is-friend-request-accepted") {
		res = RH.isFriendRequestAccepted(data);
	} else if (pathname === "/send-pings") {
		res = RH.sendPings(data);
	} else if (pathname === "/get-pings") {
		res = RH.getPings(data);
	} else {
		throw new Err("Not found", true);
	}

	console.log("─".repeat(boxWidth));
	console.log("📤 Output:");
	console.log(JSON.stringify(res, null, 2));
	console.log(border + "\n");

	if (res === undefined) {
		return Response.json({});
	}
	return Response.json(res);
}
