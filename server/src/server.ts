import { CONFIG } from "./config.ts";
import * as RH from "./request-handler";
import { getLocalIp } from "./dev.ts";
import { Err, initServer, isAdmin } from "./utils.ts";
import z from "zod";
import * as T from "@privacypin/shared";
import * as db from "./database.ts";

await initServer();
console.log(`Server running at http://${getLocalIp()}:${CONFIG.PORT}`);

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
			return new Response(JSON.stringify({ message: e.message, code: e.error_code }), {
				status: 599,
			});
		} else {
			throw e; // if this throws, there's an unhandled error
		}
	},
});

export type RouteDef<I extends z.ZodType, O extends z.ZodType> = {
	request_schema: I;
	response_schema: O;
	handler: (body: z.infer<I>, verified_user_id?: string) => z.infer<O>;
} & (
	| {
			auth_required: true;
			admin_only: boolean;
			check?: (verified_user_id: string, data: z.infer<I>) => boolean;
	  }
	| {
			auth_required: false;
			admin_only: false;
			check?: never;
	  }
);

function defineRoutes<T extends Record<string, RouteDef<any, any>>>(routes: T): T {
	return routes;
}

export const _routes = defineRoutes({
	"/create-account": {
		auth_required: false,
		admin_only: false,
		request_schema: T.CreateAccountRequestZod,
		response_schema: T.CreateAccountResponseZod,
		handler: RH.createAccount,
	},
	"/generate-signup-key": {
		auth_required: true,
		admin_only: true,
		request_schema: T.GenerateSignupKeyRequestZod,
		response_schema: T.GenerateSignupKeyResponseZod,
		handler: RH.generateSignupKey,
	},
	"/create-friend-request": {
		auth_required: true,
		admin_only: true,
		request_schema: T.CreateFriendRequestRequestZod,
		response_schema: T.CreateFriendRequestResponseZod,
		check: (verified_user_id: string, data: T.CreateFriendRequestRequest) => {
			return data.sender_id === verified_user_id;
		},
		handler: RH.createFriendRequest,
	},
	"/accept-friend-request": {
		auth_required: true,
		admin_only: false,
		request_schema: T.AcceptFriendRequestRequestZod,
		response_schema: T.AcceptFriendRequestResponseZod,
		check: (verified_user_id: string, data: T.AcceptFriendRequestRequest) => {
			return data.accepter_id === verified_user_id;
		},
		handler: RH.acceptFriendRequest,
	},
	"/is-friend-request-accepted": {
		auth_required: true,
		admin_only: false,
		request_schema: T.IsFriendRequestAcceptedRequestZod,
		response_schema: T.IsFriendRequestAcceptedResponseZod,
		check: (verified_user_id: string, data: T.IsFriendRequestAcceptedRequest) => {
			return data.accepter_id === verified_user_id || data.sender_id === verified_user_id;
		},
		handler: RH.isFriendRequestAccepted,
	},
	"/send-pings": {
		auth_required: true,
		admin_only: false,
		request_schema: T.SendPingsRequestZod,
		response_schema: T.SendPingsResponseZod,
		check: (verified_user_id: string, data: T.SendPingsRequest) => {
			return data.every((p) => p.sender_id === verified_user_id);
		},
		handler: RH.sendPings,
	},
	"/get-pings": {
		auth_required: true,
		admin_only: false,
		request_schema: T.GetPingsRequestZod,
		response_schema: T.GetPingsResponseZod,
		check: (verified_user_id: string, data: T.GetPingsRequest) => {
			return data.receiver_id === verified_user_id;
		},
		handler: RH.getPings,
	},
});

export const routes = _routes satisfies {
	[K in keyof typeof _routes]: RouteDef<
		(typeof _routes)[K]["request_schema"],
		(typeof _routes)[K]["response_schema"]
	>;
};

async function verifyAuth<I extends z.ZodType, O extends z.ZodType>(
	body: unknown,
	route: RouteDef<I, O>,
): Promise<z.infer<I>> {
	// parse/extract the auth and data
	const parsed = T.ASDF.parse(body);
	const auth = parsed.auth;
	const aaa = parsed.data === undefined ? undefined : JSON.parse(parsed.data);
	const data = route.request_schema.parse(aaa);

	// AUTH

	if (!route.auth_required) return data;
	if (auth === undefined) throw new Err("Unauthorized", true);

	const pkey = db.getPubKey(auth.user_id);
	if (pkey === null) throw new Err("No public key found");

	const buffer_to_sign = (parsed.data === undefined ? "" : parsed.data) + auth.user_id;

	const encoder = new TextEncoder();

	const bbb = await crypto.subtle.importKey("jwk", pkey, "Ed25519", false, ["verify"]);
	const auth_accepted = await crypto.subtle.verify(
		{ name: "Ed25519" },
		bbb,
		Buffer.from(auth.signature, "base64"),
		Buffer.from(buffer_to_sign),
	);
	if (!auth_accepted) throw new Err("Bad auth");
	db.updatePubKey(auth.user_id, auth.next_pkey);

	if (route.admin_only) {
		const is_admin = await isAdmin(auth.user_id);
		if (!is_admin) throw new Err("Admin access required", true);
	}

	if (route.check !== undefined) {
		const check_suceeded = route.check(auth.user_id, data);
		if (!check_suceeded) throw new Err("Failed check", true);
	}
	return data;
}

async function idkyet(req: Request) {
	// Pretty one-box log
	const emoji = "📦";
	const boxWidth = 60;
	const border = "═".repeat(boxWidth);

	const megaBorder = "█".repeat(boxWidth);

	const url = new URL(req.url);

	console.log("\n" + megaBorder);
	console.log(`${emoji}  Request: ${url.pathname}`);
	console.log("─".repeat(boxWidth));
	console.log("📥 Input:");

	// @ts-expect-error
	const route = routes[url.pathname];
	if (route === undefined) throw new Err("Not found", true);

	const body = await req.json();

	console.log(JSON.stringify(body, null, 2));
	console.log("─".repeat(boxWidth));
	console.log("⚙️ Processing:");

	const data = await verifyAuth(body, route);

	const res = await route.handler(data);

	console.log("─".repeat(boxWidth));
	console.log("📤 Output:");
	console.log(JSON.stringify(res, null, 2));
	console.log(border + "\n");

	if (res === undefined) {
		return Response.json({});
	}
	return Response.json(res);
}
