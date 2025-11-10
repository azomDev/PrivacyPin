import { expect } from "bun:test";

export const URL = "http://127.0.0.1:3000";

export async function generateUser(signup_key: string | undefined, should_be_admin: boolean = false): Promise<string> {
	if (signup_key === undefined) {
		throw new Error("signup_key was not provided or captured from server output");
	}

	const res = await fetch(`${URL}/create-account`, {
		method: "POST",
		body: signup_key,
	});
	const json = await res.json();
	expect(res.status).toBe(200);
	expect(json).toEqual({
		user_id: expect.any(String),
		is_admin: should_be_admin,
	});

	return json.user_id;
}

export async function post(endpoint: string, user_id: string, data: Object | string | undefined): Promise<any> {
	const headers: Record<string, string> = {
		"x-auth": JSON.stringify({ user_id }),
	};

	let stringified_data: string | undefined;

	if (typeof data === "object") {
		stringified_data = JSON.stringify(data);
		headers["Content-Type"] = "application/json";
	} else {
		stringified_data = data;
	}

	const res = await fetch(`${URL}/${endpoint}`, {
		method: "POST",
		headers,
		body: stringified_data,
	});

	expect(res.status).toBe(200);

	return await res.text();
}
