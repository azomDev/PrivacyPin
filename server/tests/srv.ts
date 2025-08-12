export let server: ReturnType<typeof Bun.spawn> | null = null;

export const SERVER_DIR = `${import.meta.dir}/..`;

export async function startOrRestartServer(): Promise<string | undefined> {
	if (server !== null) {
		server.kill();
		server = null;
	}

	server = Bun.spawn({
		cmd: ["bun", "run", "--cwd", SERVER_DIR, "./src/server.ts"],
		stdout: "pipe",
		stderr: "inherit",
	});

	const log_reader = server.stdout.getReader();
	const decoder = new TextDecoder();

	// Key‑finder with timeout
	const timeoutMs = 1000;
	const start = Date.now();
	let signupKey: string | undefined;

	while (Date.now() - start < timeoutMs) {
		const { value, done } = await log_reader.read();
		if (done) break; // stream closed
		const text = decoder.decode(value);
		const match = text.match(/Admin signup key:\s*(\w+)/);
		if (match) {
			signupKey = match[1];
			break;
		}
		if (text.includes("Server started")) {
			break;
		}
	}

	// Background logger. This runs until the server is stopped.
	;(async () => {
		while (true) {
			const { value, done } = await log_reader.read();
			if (done) break;
			process.stdout.write(decoder.decode(value));
		}
	})();

	return signupKey;
}


export function stopServer() {
	if (server !== null) {
		server.kill();
		server = null;
	}
}
