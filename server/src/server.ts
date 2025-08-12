import { CONFIG } from "./config.ts";
import * as RH from "./request-handler";
import { getLocalIp } from "./dev.ts";
import { Err, initServer, isAdmin } from "./utils.ts";
import z from "zod";
import * as T from "@privacypin/shared";

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
			return new Response(JSON.stringify({ message: e.message, code: e.error_code }), { status: 599 });
		} else {
			throw e; // if this throws, there's an unhandled error
		}
	},
});

type RouteDef<I extends z.ZodTypeAny, O extends z.ZodTypeAny> = {
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
			return data.every(p => p.sender_id === verified_user_id);
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

export const routes = _routes as {
	[K in keyof typeof _routes]: RouteDef<
		typeof _routes[K]["request_schema"],
		typeof _routes[K]["response_schema"]
	>;
};

export type RoutesMap = typeof routes;


async function verifyAuth<I extends z.ZodTypeAny, O extends z.ZodTypeAny>(body: unknown, route: RouteDef<I, O>) {
	const asdf = z.object({
		auth: z.optional(z.object({
			user_id: z.string(),
		})),
		data: z.unknown()
	});

	// parse/extract the auth and data
	const parsed = asdf.parse(body);
	const auth = parsed.auth;
	const data = route.request_schema.parse(parsed.data);

	// AUTH

	if (!route.auth_required) return;
	if (auth === undefined) throw new Err("Unauthorized", true);

	if (route.admin_only) {
		const is_admin = await isAdmin(auth.user_id);
		if (!is_admin) throw new Err("Admin access required", true);
	}

	if (route.check !== undefined) {
		const check_suceeded = route.check(auth.user_id, data);
		if (!check_suceeded) throw new Err("Failed check", true);
	}
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

	// @ts-expect-error
	const route = routes[url.pathname];
	if (route === undefined) throw new Err("Not found", true);

	const body = await req.json();
	const verified_user_id = await verifyAuth(body, route);

	const res = await route.handler(body.data);



	console.log("─".repeat(boxWidth));
	console.log("📥 Input:");
	console.log(JSON.stringify(body, null, 2));
	console.log("─".repeat(boxWidth));
	console.log("📤 Output:");
	console.log(JSON.stringify(res, null, 2));
	console.log(border + "\n");

	if (res === undefined) {
		return Response.json({});
	}
	return Response.json(res);
}
