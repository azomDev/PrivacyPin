import { apiRequest } from "./utils/api.ts";
import { Store } from "./utils/store.ts";

async function waitForFriendRequestAcceptance(friend_request: { sender_id: string; accepter_id: string }): Promise<boolean> {
	let count = 0;

	while (count < 15) {
		try {
			const { accepted } = await apiRequest("/is-friend-request-accepted", friend_request);
			if (accepted) return true;
		} catch (e) {
			if (e instanceof Error) alert(`Error: ${(e as Error).message}`);
			throw e;
		}

		count++;
		await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
	}

	return false;
}

export async function sendFriendRequest() {
	const friendNameInput = document.getElementById("friend-name") as HTMLInputElement;
	const friendIdInput = document.getElementById("friend-id") as HTMLInputElement;

	const friend_name = friendNameInput.value;
	const friend_id = friendIdInput.value;

	const user_id = await Store.get("user_id");

	const friend_request = {
		sender_id: user_id!,
		accepter_id: friend_id,
	};

	try {
		await apiRequest("/create-friend-request", friend_request);
	} catch (e) {
		if (e instanceof Error) alert(`Error: ${(e as Error).message}`);
		throw e;
	}

	const accepted = await waitForFriendRequestAcceptance(friend_request);
	if (!accepted) {
		alert("Friend request not accepted in time. Please try again later.");
		return;
	}

	const friends = (await Store.get("friends")) ?? [];
	friends.push({
		name: friend_name,
		id: friend_id,
	});
	Store.set("friends", friends);

	// Reset inputs after sending request
	friendNameInput.value = "";
	friendIdInput.value = "";
}

export async function acceptFriendRequest() {
	const friendNameInput = document.getElementById("friend-name") as HTMLInputElement;
	const friendIdInput = document.getElementById("friend-id") as HTMLInputElement;

	const friend_name = friendNameInput.value;
	const friend_id = friendIdInput.value;

	const user_id = await Store.get("user_id");

	try {
		await apiRequest("/accept-friend-request", {
			sender_id: friend_id,
			accepter_id: user_id!,
		});
	} catch (e) {
		if (e instanceof Error) alert(`Error: ${(e as Error).message}`);
		throw e;
	}

	const friends = (await Store.get("friends")) ?? [];
	friends.push({
		name: friend_name,
		id: friend_id,
	});
	Store.set("friends", friends);

	// Reset inputs after accepting request
	friendNameInput.value = "";
	friendIdInput.value = "";
}
