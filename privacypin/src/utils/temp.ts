import { Store } from "./store.ts";
import { apiRequest } from "./api.ts";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Store as TauriStore } from "@tauri-apps/plugin-store";
import { goto } from "$app/navigation";

// functions in here are temporary and will be removed in the future

export async function showLatestFriendPing(friend_id: string) {
	const user_id = await Store.get("user_id");

	const { pings } = await apiRequest("/get-pings", {
		sender_id: friend_id,
		receiver_id: user_id,
	});

	const ping = JSON.parse(pings[0]) as { longitude: string; latitude: string; timestamp: string }; // temporary until actually encrypted
	console.log(ping)
	console.log(`geo:0,0?q=${ping.latitude},${ping.longitude}`)

	await openUrl(`geo:0,0?q=${ping.latitude},${ping.longitude}`);
}

export async function sendPings() {
	const friends = await Store.get("friends");
	if (friends.length === 0) {
		alert("No friends to send pings to");
		return;
	}

	// Latitude ranges from -90 to 90
	const latitude = parseFloat((Math.random() * 180 - 90).toFixed(6));

	// Longitude ranges from -180 to 180
	const longitude = parseFloat((Math.random() * 360 - 180).toFixed(6));

	const user_id = await Store.get("user_id");
	const pings = [];
	for (const friend of friends) {
		pings.push({
			sender_id: user_id,
			receiver_id: friend.id,
			encrypted_ping: JSON.stringify({ latitude, longitude }),
		});
	}
	apiRequest("/send-pings", { pings });
	console.log(`Sending pings to ${latitude}, ${longitude}`);
}

export async function appReset() {
	const clearStore = await TauriStore.load("settings.json");
	clearStore.clear();
	clearStore.save();
	goto("/");
}
