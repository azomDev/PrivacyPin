import { expect } from "bun:test";
export const URL = "http://localhost:8080";

export async function generateUser(signup_key: string | undefined, should_be_admin: boolean = false): Promise<string> {
	if (signup_key === undefined) {
		throw new Error("signup_key was not provided or captured from server output");
	}
	const res = await fetch(`${URL}/create-account`, { method: "POST", body: JSON.stringify({ data: { signup_key } }) });
	const json = await res.json();
	expect(res.status).toBe(200);
	expect(json).toEqual({
		user_id: expect.any(String),
		is_admin: should_be_admin,
	});

	return json.user_id;
}

export async function generateSignupKey(user_id: string): Promise<string> {
	const res = await fetch(`${URL}/generate-signup-key`, { method: "POST", body: JSON.stringify({ auth: { user_id } }) });
	const json = await res.json();
	expect(res.status).toBe(200);
	expect(json).toEqual({
		signup_key: expect.any(String),
	});
	return json.signup_key;
}
