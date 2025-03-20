import { Store as TauriStore } from "@tauri-apps/plugin-store";
import { Store } from "./utils/store";
import { handleAccountCreationForm } from "./account-creation.ts";
import { checkIfAdmin, displayFriends, displayUserId } from "./home.ts";
import { acceptFriendRequest, sendFriendRequest } from "./add-friend.ts";

export async function init() {
	const user_id = await Store.get("user_id");
	if (user_id === undefined) {
		document.getElementById("home-page")!.style.display = "none";
		document.getElementById("account-creation-page")!.style.display = "block";
		document.getElementById("account-creation-form")!.addEventListener("submit", handleAccountCreationForm);
		return;
	}

	await displayFriends();
	await displayUserId();
	await checkIfAdmin();

	const sendFriendRequestButton = document.getElementById("send-friend-request") as HTMLButtonElement;
	const acceptFriendRequestButton = document.getElementById("accept-friend-request") as HTMLButtonElement;
	sendFriendRequestButton.addEventListener("click", sendFriendRequest);
	acceptFriendRequestButton.addEventListener("click", acceptFriendRequest);
}

async function testingInit() {
	// TESTING ONLY VVVVVVVVVVVVVVVV

	const clearStore = await TauriStore.load("settings.json");
	clearStore.clear();
	clearStore.save();

	// await Store.set("user_id", "asdf");

	await Store.set("is_admin", true);
	const dummy_friends = [
		{ name: "Alice", id: "1" },
		{ name: "Bob", id: "2" },
		{ name: "Charlie", id: "3" },
		{ name: "Diana", id: "4" },
	];
	await Store.set("friends", dummy_friends);

	// TESTING ONLY ^^^^^^^^^^^^^^^^^
}

await testingInit(); // Only for testing
await init();
