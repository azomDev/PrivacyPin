import { beforeEach, afterAll, describe, expect, it } from "bun:test";
import { rmSync } from "fs";
import { initServer } from "../src/utils";
import { RESET_DATABASE_FOR_TESTING } from "../src/database";
import "../src/server.ts";
import { generateSignupKey, createAccount, createLink, challengeAndPost } from "./test_utils.ts";

beforeEach(async () => {
	// Reset server
	RESET_DATABASE_FOR_TESTING();
	rmSync("admin_id.txt", { force: true });
	await initServer();
});

// at the end of all tests, exit the process
afterAll(() => {
	process.exit();
});

describe("Bun Server Sequential Tests", () => {
	it("should create the admin account", async () => {
		const signup_key = await generateSignupKey();
		const user = await createAccount(signup_key);

		// Check that the account is the admin account since it's the first account created
		const admin_file = Bun.file("admin_id.txt");
		expect(await admin_file.exists()).toBe(true);
		const admin_id = await admin_file.text();
		expect(user.user_id).toBe(admin_id);
	});

	it("should create and accept a friend request", async () => {
		const signup_key1 = await generateSignupKey();
		const signup_key2 = await generateSignupKey();

		const user1 = await createAccount(signup_key1);
		const user2 = await createAccount(signup_key2);

		await createLink(user1, user2);
	});

	it("should send and get pings", async () => {
		const signup_key1 = await generateSignupKey();
		const signup_key2 = await generateSignupKey();

		const user1 = await createAccount(signup_key1);
		const user2 = await createAccount(signup_key2);

		await createLink(user1, user2);

		const dummy_encrypted_ping = "this is a dummy ping";
		const pings = [
			{
				sender_id: user1.user_id,
				receiver_id: user2.user_id,
				encrypted_ping: dummy_encrypted_ping,
			},
		];

		await challengeAndPost("send-pings", JSON.stringify(pings), user1.user_id, user1.private_sign_key);

		const get_response = await challengeAndPost(
			"get-pings",
			JSON.stringify({
				sender_id: user1.user_id,
				receiver_id: user2.user_id,
			}),
			user2.user_id,
			user2.private_sign_key,
		);

		const receivedPings = await get_response.json();
		expect(receivedPings.length).toBeGreaterThan(0);
		expect(receivedPings[0]).toBe(dummy_encrypted_ping);
	});
});
