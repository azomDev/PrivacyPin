import { SERVER_DIR, startOrRestartServer, stopServer } from "./srv.ts";
import { rm } from "node:fs/promises";
import {
	describe,
	test,
	expect,
	beforeAll,
	afterAll,
	beforeEach,
} from "bun:test";
import { generateSignupKey, generateUser, URL } from "./utils.ts";

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
	test("Can't use signup key if it was used", async () => {
		const admin_id = await generateUser(signup_key, true);

		const res = await fetch(`${URL}/create-account`, {
			method: "POST",
			body: JSON.stringify({ data: { signup_key } }),
		});
		expect(res.status).toBe(599);
	});
	test("Main usage test", async () => {
		const admin_id = await generateUser(signup_key, true);
		const new_signup_key = await generateSignupKey(admin_id);
		const user_id = await generateUser(new_signup_key);

		const res1 = await fetch(`${URL}/create-friend-request`, {
			method: "POST",
			body: JSON.stringify({ data: { sender_id: admin_id, accepter_id: user_id }, auth: { user_id: admin_id } }),
		});
		expect(res1.status).toBe(200);

		const res2 = await fetch(`${URL}/accept-friend-request`, {
			method: "POST",
			body: JSON.stringify({ data: { sender_id: admin_id, accepter_id: user_id }, auth: { user_id: user_id } }),
		});
		expect(res2.status).toBe(200);

		const res3 = await fetch(`${URL}/is-friend-request-accepted`, {
			method: "POST",
			body: JSON.stringify({ data: { sender_id: admin_id, accepter_id: user_id }, auth: { user_id: admin_id } }),
		});
		expect(res3.status).toBe(200);
		expect((await res3.json()).accepted).toBe(true);

		const res4 = await fetch(`${URL}/send-pings`, {
			method: "POST",
			body: JSON.stringify({ data: [{ sender_id: admin_id, receiver_id: user_id, encrypted_ping: "this is definitely encrypted trust #1" }], auth: { user_id: admin_id } }),
		});
		expect(res4.status).toBe(200);

		const res5 = await fetch(`${URL}/send-pings`, {
			method: "POST",
			body: JSON.stringify({ data: [{ sender_id: admin_id, receiver_id: user_id, encrypted_ping: "this is definitely encrypted trust #2" }], auth: { user_id: admin_id } }),
		});
		expect(res5.status).toBe(200);

		const res6 = await fetch(`${URL}/get-pings`, {
			method: "POST",
			body: JSON.stringify({ data: { sender_id: admin_id, receiver_id: user_id }, auth: { user_id: admin_id } }),
		});
		expect(res6.status).toBe(200);
		expect((await res6.json()).pings).toEqual(["this is definitely encrypted trust #2", "this is definitely encrypted trust #1"]);
	});
});
