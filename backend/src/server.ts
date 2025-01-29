import { createAccount, generateSignupKey } from "./httpAPI";

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
		}
		return new Response();
	},
});

console.log(`Server started on port ${server.port}`);
