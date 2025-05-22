import type { ClientEncryptedPing, GlobalFriendRequest, ServerPing, GlobalSignData } from "./globalTypes";

type HandlerConfig<K extends keyof APIRoutes> =
	APIRoutes[K]["auth"] extends true
		? {
			process: (input: APIRoutes[K]["input"]) => APIRoutes[K]["output"];
			check?: (user_id: string, input: APIRoutes[K]["input"]) => boolean;
		}
		: {
			process: (input: APIRoutes[K]["input"]) => APIRoutes[K]["output"];
			check?: undefined;
		};

export type Handlers = {
	[K in keyof APIRoutes]: HandlerConfig<K>;
};

export const APIRoutesRuntime: { [K in keyof APIRoutes]: { auth: APIRoutes[K]["auth"] } } = {
	"/create-account": { auth: false },
	"/create-friend-request": { auth: true },
	"/accept-friend-request": { auth: true },
	"/is-friend-request-accepted": { auth: true },
	"/get-pings": { auth: true },
	"/generate-signup-key": { auth: true },
	"/send-pings": { auth: true },
};

export type APIRoutes = {
	"/create-account": {
		input: {
			signup_key: string;
			pub_sign_key: JsonWebKey;
		},
		output: {
			user_id: string;
			is_admin: boolean;
		},
		auth: false,
	},
	"/create-friend-request": {
		input: GlobalFriendRequest,
		output: undefined,
		auth: true,
	},
	"/accept-friend-request": {
		input: GlobalFriendRequest,
		output: undefined,
		auth: true,
	},
	"/is-friend-request-accepted": {
		input: GlobalFriendRequest,
		output: {
			accepted: boolean;
		},
		auth: true,
	},
	"/get-pings": {
		input: {
			sender_id: string;
			receiver_id: string;
		},
		output: {
			pings: ClientEncryptedPing[];
		},
		auth: true,
	},
	"/generate-signup-key": {
		input: {},
		output: {
			signup_key: string;
		},
		auth: true,
	},
	"/send-pings": {
		input: {
			pings: ServerPing[],
		},
		output: undefined,
		auth: true,
	},
};


type HTTPServerOptions = {
	port: number;
	handlers: Handlers;
	signatureVerification: (content: string, sign_data: GlobalSignData) => Promise<boolean>;
};

export function HTTPServer({port, handlers, signatureVerification}: HTTPServerOptions) {
	Bun.serve({
		port,
		async fetch(req) {
			console.log(req);
			const url = new URL(req.url);

			const endpoint = url.pathname as keyof APIRoutes;
			const handler = handlers[endpoint];
			if (handler === undefined) throw new Err("Not found", true);
			const req_content = await req.text();

			const req_json = JSON.parse(req_content);

			if (APIRoutesRuntime[endpoint].auth) {
				const sign_data_header = req.headers.get("sign-data");
				if (sign_data_header === null) throw new Err("No signature data provided", true);
				const sign_data = JSON.parse(sign_data_header) as GlobalSignData;
				const is_signature_valid = await signatureVerification(req_content, sign_data);
				if (!is_signature_valid) throw new Err("Invalid signature", true);

				if (handler.check !== undefined) {
					handler.check(sign_data.user_id, req_json);
				}
			}

			const response_data = handler.process(req_json);

			console.log(response_data);

			if (response_data === undefined) {
				return Response.json({});
			}

			return Response.json(response_data);
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
}

export class Err extends Error {
	public log_server: boolean;
	public error_code: number;

	constructor(message: string, log_server: boolean = false, error_code: number = 599) {
		super(message);
		this.name = "Err";
		this.log_server = log_server;
		this.error_code = error_code;
	}
}
