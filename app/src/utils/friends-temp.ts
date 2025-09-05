import { post } from "./api.ts";
import { Store } from "./store.ts";

async function waitForFriendRequestAcceptance(friend_id: string): Promise<boolean> {
	for (let attempt = 0; attempt < 15; attempt++) {
		const res = await post("is-friend-request-accepted", friend_id);
		const accepted = JSON.parse(res);
		if (accepted) return true;
		await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
	}

	return false;
}

export async function sendFriendRequest(friend_name: string, friend_id: string) {
	await post("create-friend-request", friend_id);

	const accepted = await waitForFriendRequestAcceptance(friend_id);
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
	await post("accept-friend-request", friend_id);
	const friends = await Store.get("friends");
	friends.push({
		name: friend_name,
		id: friend_id,
	});
	Store.set("friends", friends);
}
