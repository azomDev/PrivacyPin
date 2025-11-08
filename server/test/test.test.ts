import { SERVER_DIR, startOrRestartServer, stopServer } from "./srv.ts";
import { rm } from "node:fs/promises";
import { describe, test, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { generateUser, post, URL } from "./utils.ts";

console.log(`SERVER_DIR: ${SERVER_DIR}`);
let signup_key: string | undefined = undefined;

beforeEach(async () => {
	signup_key = await startOrRestartServer();
	await Bun.sleep(100);
});

afterAll(async () => {
	stopServer();
});

describe("API tests", () => {
	test("Main usage test", async () => {
		const admin = await generateUser(signup_key, true);

		const res1 = await post("generate-signup-key", admin, undefined);
		expect(res1).toEqual(expect.any(String));

		const user = await generateUser(res1);

		await post("create-friend-request", admin, user.user_id);

		await post("accept-friend-request", user, admin.user_id);

		const res2 = await post("is-friend-request-accepted", admin, user.user_id);
		expect(JSON.parse(res2)).toBe(true);

		await post("send-pings", admin, [
			{
				receiver_id: user.user_id,
				encrypted_ping: "this is definitely encrypted trust #1",
			},
		]);

		await post("send-pings", admin, [
			{
				receiver_id: user.user_id,
				encrypted_ping: "this is definitely encrypted trust #2",
			},
		]);

		const res3 = await post("get-pings", user, admin.user_id);

		expect(JSON.parse(res3)).toEqual(["this is definitely encrypted trust #2", "this is definitely encrypted trust #1"]);
	});
});
