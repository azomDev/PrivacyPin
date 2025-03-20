import { apiRequest } from "./utils/api.ts";
import { Store } from "./utils/store.ts";
import { openUrl } from "@tauri-apps/plugin-opener";

export async function checkIfAdmin() {
	const is_admin = await Store.get("is_admin");

	const generateKeyContainer = document.getElementById("generate-signup-key-container")!;
	if (is_admin) {
		generateKeyContainer.style.display = "block";

		const generateButton = document.getElementById("generate-signup-key")!;
		generateButton.onclick = async () => {
			// todo check that it displays the key well

			let response;
			try {
				response = await apiRequest("/generate-signup-key", null);
			} catch (e) {
				if (e instanceof Error) alert(`Error: ${(e as Error).message}`);
				throw e;
			}
			const signupKeyDisplay = document.getElementById("signup-key-display")!;
			signupKeyDisplay.style.display = "block";
			signupKeyDisplay.textContent = `Your Signup Key: ${response.signup_key}`;
		};
	}
}

export async function displayUserId() {
	const user_id = await Store.get("user_id");

	const userIdDisplayElement = document.getElementById("user-id-display")!;
	userIdDisplayElement.textContent = `Your User ID: ${user_id}`;
}

export async function displayFriends() {
	const friends = await Store.get("friends");
	const friend_list_container = document.getElementById("friends-list");

	if (friends === undefined || friends.length === 0) {
		const no_friend_message = document.createElement("p");
		no_friend_message.textContent = "You have no friends yet.";
		friend_list_container!.appendChild(no_friend_message);
		return;
	}

	async function showLatestFriendPing(friend_id: string) {
		const user_id = await Store.get("user_id");

		let response;
		try {
			response = await apiRequest("/get-pings", {
				sender_id: friend_id,
				receiver_id: user_id!,
			});
		} catch (e) {
			if (e instanceof Error) alert(`Error: ${(e as Error).message}`);
			throw e;
		}

		const ping = JSON.parse(response.pings[0]) as { longitude: string; latitude: string; timestamp: string }; // temporary until actually encrypted

		await openUrl(`geo:0,0?q=${ping.latitude},${ping.longitude}`);
	}

	friends.forEach((friend) => {
		const friendItem = document.createElement("div");
		friendItem.textContent = `Friend: ${friend.name}`;

		const button = document.createElement("button");
		button.textContent = "Get Ping"; // Button text
		button.onclick = async () => await showLatestFriendPing(friend.id);

		friendItem.appendChild(button);
		friend_list_container!.appendChild(friendItem);
	});
}
