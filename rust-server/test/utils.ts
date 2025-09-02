import { expect } from "bun:test";

export const URL = "http://localhost:3000";

export async function generateUser(
	signup_key: string | undefined,
	should_be_admin: boolean = false,
): Promise<string> {
	if (signup_key === undefined) {
		throw new Error("signup_key was not provided or captured from server output");
	}

	console.log("frontend signup key:");
	console.log(signup_key);
	const res = await fetch(`${URL}/create-account`, {
		method: "POST",
		body: signup_key,
	});
	const json = await res.json();
	console.log(json);
	expect(res.status).toBe(200);
	expect(json).toEqual({
		user_id: expect.any(String),
		is_admin: should_be_admin,
	});

	return json.user_id;
}

export async function post(
	endpoint: string,
	user_id: string,
	body: any,
	is_json: boolean = false,
): Promise<any> {
	const headers: Record<string, string> = {
		"x-auth": JSON.stringify({ user_id }),
	};

	if (is_json) {
		headers["Content-Type"] = "application/json";
	}

	const res = await fetch(`${URL}/${endpoint}`, {
		method: "POST",
		headers,
		body,
	});

	expect(res.status).toBe(200);

	return await res.text();
}
