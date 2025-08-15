import { SERVER_DIR, startOrRestartServer, stopServer } from "./srv.ts";
import { rm } from "node:fs/promises";
import { describe, test, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { generateUser, post, URL } from "./utils.ts";

console.log(`SERVER_DIR: ${SERVER_DIR}`);
let signup_key: string | undefined = undefined;

async function reset() {
	await rm(`${SERVER_DIR}/output`, { recursive: true, force: true });
	signup_key = await startOrRestartServer();
	await Bun.sleep(100);
}

beforeEach(async () => {
	await reset();
});

afterAll(async () => {
	stopServer();
	await rm(`${SERVER_DIR}/output`, { recursive: true, force: true });
});

describe("API tests", () => {
	test("Main usage test", async () => {
		const admin = await generateUser(signup_key, true);

		const res1 = await post("generate-signup-key", admin, undefined);
		expect(res1).toEqual({ signup_key: expect.any(String) });

		const user1 = await generateUser(res1.signup_key);

		await post("create-friend-request", admin, { sender_id: admin.id, accepter_id: user1.id });

		await post("accept-friend-request", user1, { sender_id: admin.id, accepter_id: user1.id });

		const res2 = await post("is-friend-request-accepted", admin, {
			sender_id: admin.id,
			accepter_id: user1.id,
		});
		expect(res2.accepted).toBe(true);

		await post("send-pings", admin, [
			{
				sender_id: admin.id,
				receiver_id: user1.id,
				encrypted_ping: "this is definitely encrypted trust #1",
			},
		]);
		await post("send-pings", admin, [
			{
				sender_id: admin.id,
				receiver_id: user1.id,
				encrypted_ping: "this is definitely encrypted trust #2",
			},
		]);

		const res3 = await post("get-pings", user1, { sender_id: admin.id, receiver_id: user1.id });
		expect(res3.pings).toEqual([
			"this is definitely encrypted trust #2",
			"this is definitely encrypted trust #1",
		]);
	});
});
