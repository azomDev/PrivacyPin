import { expect } from "bun:test";

export const URL = "http://localhost:8080";

export type User = {
	id: string;
	skey: CryptoKey;
};

export async function generateUser(
	signup_key: string | undefined,
	should_be_admin: boolean = false,
): Promise<User> {
	if (signup_key === undefined) {
		throw new Error("signup_key was not provided or captured from server output");
	}

	const aaa = await crypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]);
	const bbb = aaa.publicKey;
	const ccc = await crypto.subtle.exportKey("jwk", bbb);

	const res = await fetch(`${URL}/create-account`, {
		method: "POST",
		body: JSON.stringify({ data: JSON.stringify({ signup_key, pkey: ccc }) }),
	});
	const json = await res.json();
	expect(res.status).toBe(200);
	expect(json).toEqual({
		user_id: expect.any(String),
		is_admin: should_be_admin,
	});

	return { id: json.user_id, skey: aaa.privateKey };
}

export async function post(endpoint: string, user: User, data: Object | undefined): Promise<any> {
	const aaa = await crypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]);
	const bbb = aaa.publicKey;
	const ccc = await crypto.subtle.exportKey("jwk", bbb);

	const data_as_str = JSON.stringify(data);

	const buffer_to_sign = (data_as_str === undefined ? "" : data_as_str) + user.id;

	const ddd = await crypto.subtle.sign("Ed25519", user.skey, Buffer.from(buffer_to_sign));

	const auth = {
		user_id: user.id,
		signature: Buffer.from(ddd).toString("base64"),
		next_pkey: ccc,
	};

	const raw_body = data === undefined ? { auth } : { data: JSON.stringify(data), auth };

	const res = await fetch(`${URL}/${endpoint}`, {
		method: "POST",
		body: JSON.stringify(raw_body),
	});
	expect(res.status).toBe(200);

	user.skey = aaa.privateKey; // TODO: does that work?

	return await res.json();
}
