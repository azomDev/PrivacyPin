import { beforeEach, afterAll, describe, expect, it, test } from "bun:test";
import { rmSync } from "fs";
import { initServer } from "../src/utils";
import { RESET_DATABASE_FOR_TESTING } from "../src/database";
import "../src/server.ts";
import { generateSignupKey, createAccount, createLink, challengeAndPost } from "./test_utils.ts";
import type { Ping } from "../src/models.ts";

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

describe("PP complex valid situations", () => {
	it("should send pings to 2 users and get them back", async () => {
		const signup_key1 = await generateSignupKey();
		const signup_key2 = await generateSignupKey();
		const signup_key3 = await generateSignupKey();

		const user1 = await createAccount(signup_key1);
		const user2 = await createAccount(signup_key2);
		const user3 = await createAccount(signup_key3);

		await createLink(user1, user2);
		await createLink(user1, user3);

		const dummy_encrypted_ping1 = "this is a dummy ping";
		const dummy_encrypted_ping2 = "this is another dummy ping";
		const pings = [
			{
				sender_id: user1.user_id,
				receiver_id: user2.user_id,
				encrypted_ping: dummy_encrypted_ping1,
			},
			{
				sender_id: user1.user_id,
				receiver_id: user3.user_id,
				encrypted_ping: dummy_encrypted_ping2,
			},
		];

		await challengeAndPost("send-pings", JSON.stringify(pings), user1.user_id, user1.private_sign_key);

		const get_response1 = await challengeAndPost(
			"get-pings",
			JSON.stringify({
				sender_id: user1.user_id,
				receiver_id: user2.user_id,
			}),
			user2.user_id,
			user2.private_sign_key,
		);

		const get_response2 = await challengeAndPost(
			"get-pings",
			JSON.stringify({
				sender_id: user1.user_id,
				receiver_id: user3.user_id,
			}),
			user3.user_id,
			user3.private_sign_key,
		);

		const receivedPings1 = await get_response1.json();
		const receivedPings2 = await get_response2.json();
		expect(receivedPings1[0]).toBe(dummy_encrypted_ping1);
		expect(receivedPings2[0]).toBe(dummy_encrypted_ping2);
	});

	it("should stress test the server", async () => {
		const users_count = 500;

		const signup_key0 = await generateSignupKey();
		const user0 = await createAccount(signup_key0);

		const signup_keys = [];
		for (let i = 0; i < users_count; i++) {
			signup_keys.push(await generateSignupKey());
		}
		console.log("Generated all signup keys");

		const users = [];
		for (let i = 0; i < users_count; i++) {
			users.push(await createAccount(signup_keys[i]));
		}
		console.log("Created all users");

		for (let i = 0; i < users_count; i++) {
			await createLink(user0, users[i]);
		}
		console.log("Created all links");

		const dummy_messages = [];
		for (let i = 0; i < users_count; i++) {
			dummy_messages.push(`this is dummy ping ${i}`);
		}

		const start = Date.now();
		const pings: Ping[] = [];
		for (let i = 0; i < users_count; i++) {
			pings.push({
				sender_id: user0.user_id,
				receiver_id: users[i].user_id,
				encrypted_ping: dummy_messages[i],
			});
		}

		await challengeAndPost("send-pings", JSON.stringify(pings), user0.user_id, user0.private_sign_key);

		for (let i = 0; i < users_count; i++) {
			const get_response = await challengeAndPost(
				"get-pings",
				JSON.stringify({
					sender_id: user0.user_id,
					receiver_id: users[i].user_id,
				}),
				users[i].user_id,
				users[i].private_sign_key,
			);

			const receivedPings = await get_response.json();
			expect(receivedPings[0]).toBe(dummy_messages[i]);
		}
		const end = Date.now();
		console.log(`Time taken for ${users_count} pings: ${end - start}ms`);
	}, 1000000);
});
