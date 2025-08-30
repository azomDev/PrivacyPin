import z from "zod";
import * as T from "./types.ts";

export type RouteDef<I extends z.ZodType, O extends z.ZodType> = {
	request_schema: I;
	response_schema: O;
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

function defineRoute<I extends z.ZodType, O extends z.ZodType>(route: RouteDef<I, O>) {
	return route;
}

export const _routes = {
	"/create-account": defineRoute({
		auth_required: false,
		admin_only: false,
		request_schema: T.CreateAccountRequestZod,
		response_schema: T.CreateAccountResponseZod,
	}),
	"/generate-signup-key": defineRoute({
		auth_required: true,
		admin_only: true,
		request_schema: T.GenerateSignupKeyRequestZod,
		response_schema: T.GenerateSignupKeyResponseZod,
	}),
	"/create-friend-request": defineRoute({
		auth_required: true,
		admin_only: false,
		request_schema: T.CreateFriendRequestRequestZod,
		response_schema: T.CreateFriendRequestResponseZod,
		check: (verified_user_id, data) => {
			return data.sender_id === verified_user_id;
		},
	}),
	"/accept-friend-request": defineRoute({
		auth_required: true,
		admin_only: false,
		request_schema: T.AcceptFriendRequestRequestZod,
		response_schema: T.AcceptFriendRequestResponseZod,
		check: (verified_user_id, data) => {
			return data.accepter_id === verified_user_id;
		},
	}),
	"/is-friend-request-accepted": defineRoute({
		auth_required: true,
		admin_only: false,
		request_schema: T.IsFriendRequestAcceptedRequestZod,
		response_schema: T.IsFriendRequestAcceptedResponseZod,
		check: (verified_user_id, data) => {
			return data.accepter_id === verified_user_id || data.sender_id === verified_user_id;
		},
	}),
	"/send-pings": defineRoute({
		auth_required: true,
		admin_only: false,
		request_schema: T.SendPingsRequestZod,
		response_schema: T.SendPingsResponseZod,
		check: (verified_user_id, data) => {
			return data.every((p) => p.sender_id === verified_user_id);
		},
	}),
	"/get-pings": defineRoute({
		auth_required: true,
		admin_only: false,
		request_schema: T.GetPingsRequestZod,
		response_schema: T.GetPingsResponseZod,
		check: (verified_user_id, data) => {
			return data.receiver_id === verified_user_id;
		},
	}),
};

type Routes = typeof _routes;

type HandlerMap = {
	[K in keyof Routes]: (
		body: z.infer<Routes[K]["request_schema"]>,
	) => z.infer<Routes[K]["response_schema"]> | Promise<z.infer<Routes[K]["response_schema"]>>;
};

type Server = {
	port: number;
	handlers: HandlerMap;
	auth: (body: unknown, route: RouteDef<z.ZodAny, z.ZodAny>) => void | Promise<void>;
};

function defineServer(server: Server) {
	return Bun.serve({
		port: server.port,
		async fetch(req) {
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
			const route = routes[url.pathname]; // TODO routes is not defined
			if (route === undefined) throw new Error("Endpoint not found");

			const body = await req.json();

			console.log(JSON.stringify(body, null, 2));
			console.log("─".repeat(boxWidth));
			console.log("⚙️ Processing:");

			const parsed = T.ASDF.parse(body);
			const auth = parsed.auth;
			let bbb;
			if (parsed.data === undefined) {
			} else {
			}
			const aaa = parsed.data === undefined ? undefined : JSON.parse(parsed.data);
			const data = route.request_schema.parse(aaa);

			await server.auth(body, route);

			const res = await route.handler(data);

			console.log("─".repeat(boxWidth));
			console.log("📤 Output:");
			console.log(JSON.stringify(res, null, 2));
			console.log(border + "\n");

			if (res === undefined) {
				return Response.json({});
			}
			return Response.json(res);
		},
		error(e: Error) {
			// if (e instanceof Err) {
			// if (e.log_server) {
			// console.error(e);
			// }
			// return new Response(JSON.stringify({ message: e.message, code: e.error_code }), {
			// status: 599,
			// });
			// } else {
			// throw e; // if this throws, there's an unhandled error
			// }
		},
	});
}
