import { initServer, isSignatureValid } from "./utils";
import { handlers } from "./handlers";
import type { APIRoutes } from "../../shared/apiTypes";
import type { GlobalSignData } from "../../shared/globalTypes";

await initServer();
const PORT = 8080;
console.log(`http://127.0.0.1:${PORT}`);

const server = Bun.serve({
	port: PORT,
	async fetch(req) {
		const url = new URL(req.url);
		console.log(req);

		const endpoint = url.pathname as keyof APIRoutes;
		console.log(endpoint);
		const handler = handlers[endpoint]; // can also be undefined if it does not match an endpoint

		const req_content = await req.text();
		let req_json = null;
		if (req_content !== "") {
			req_json = JSON.parse(req_content);
		}

		if (handler === undefined) throw new Error("Not found");

		if (handler.auth) {
			const sign_data_header = req.headers.get("sign-data");
			if (sign_data_header === null) throw new Error("No signature data provided");
			const sign_data = JSON.parse(sign_data_header) as GlobalSignData; // todo either add checks for the type or do something typesafe

			const is_signature_valid = await isSignatureValid(req_content, sign_data);

			if (!is_signature_valid) throw new Error("Invalid signature");

			if (handler.check !== undefined) {
				// @ts-ignore because it can't know which endpoint it is so input goes to "never"
				handler.check(user_id, req_json);
			}
		}

		// @ts-ignore because it can't know which endpoint it is so input goes to "never"
		const response_data = handler.process(req_json);
		console.log(response_data);
		return Response.json(response_data);
	},
	error(err: Error) {
		console.error(err);
		return new Response(err.message, {
			status: 500,
		});
	},
});

console.log(`Server started on port ${server.port}`);
