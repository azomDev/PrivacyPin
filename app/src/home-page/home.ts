import Alpine from "alpinejs";
import { Store } from "../utils/store.ts";
import { post } from "../utils/api.ts";

Alpine.data("homePageState", () => ({
	friends: [
		{ id: "123", name: "Alice Johnson" },
		{ id: "456", name: "Bob Smith" },
		{ id: "789", name: "Carol Davis" },
	],
	newSignupKey: "AOEUI",

	timeAgo() {
		return "2m ago";
	},

	viewLocation(friend_id: string) {
		alert(`Opening the location for the friend with id ${friend_id}`);
	},

	friendOptions(friend_id: string) {
		alert(`Options for friend id ${friend_id}`);
	},

	addFriend() {
		alert("Add friend functionality would open here");
	},

	openSettings() {
		alert("Settings would open here");
	},

	async generateSignupKey() {
		const res = await post("generate-signup-key", undefined);
		this.newSignupKey = res;
		console.log(res);
	},

	isAdmin() {
		return Store.get("is_admin");
	},
}));

Alpine.start();
