import { get_db_message } from "./db";

const server = Bun.serve({
	fetch(req) {
		return new Response(get_db_message().message);
	},
});

console.log(`Server started on port ${server.port}`);
