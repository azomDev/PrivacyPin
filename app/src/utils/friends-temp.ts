import { type GlobalFriendRequest } from "@privacypin/shared";
import { apiRequest } from "./api.ts";
import { Store } from "./store.ts";

async function waitForFriendRequestAcceptance(friend_request: GlobalFriendRequest): Promise<boolean> {
	for (let attempt = 0; attempt < 15; attempt++) {
		const { accepted } = await apiRequest("/is-friend-request-accepted", friend_request);
		if (accepted) return true;
		await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
	}

	return false;
}

export async function sendFriendRequest(friend_name: string, friend_id: string) {
	const user_id = await Store.get("user_id");

	const friend_request = {
		sender_id: user_id,
		accepter_id: friend_id,
	};

	await apiRequest("/create-friend-request", friend_request);

	const accepted = await waitForFriendRequestAcceptance(friend_request);
	console.log("Friend request accepted:", accepted);
	if (!accepted) {
		alert("Friend request not accepted in time. Please try again later.");
		return;
	}

	const friends = await Store.get("friends");
	friends.push({
		name: friend_name,
		id: friend_id,
	});
	Store.set("friends", friends);
}

export async function acceptFriendRequest(friend_name: string, friend_id: string) {
	const user_id = await Store.get("user_id");

	await apiRequest("/accept-friend-request", {
		sender_id: friend_id,
		accepter_id: user_id,
	});

	const friends = await Store.get("friends");
	friends.push({
		name: friend_name,
		id: friend_id,
	});
	Store.set("friends", friends);
}
