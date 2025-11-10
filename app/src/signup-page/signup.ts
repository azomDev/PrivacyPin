import Alpine from "alpinejs";
import { createAccount } from "../utils/api.ts";
import { Store } from "../utils/store.ts";

Alpine.data("signupPageState", () => ({
	serverAddress: "",
	signupKey: "",
	get isDoingStuff() {
		return this.isConnecting || this.isScanning;
	},
	isScanning: false,
	isConnecting: false,

	async signup() {
		this.isConnecting = true;
		await new Promise((resolve) => setTimeout(resolve, 2000)); // temp
		try {
			const res = await createAccount(this.serverAddress, this.signupKey);
			Store.set("is_admin", res.is_admin);
			Store.set("user_id", res.user_id);
			window.location.href = "/src/home-page/home.html";
		} catch (e) {
			this.isConnecting = false;
		}
	},

	async scanQR() {
		this.isScanning = true;
		await new Promise((resolve) => setTimeout(resolve, 1000));
		this.serverAddress = "dummy server address";
		this.signupKey = "dummy signup key";
		this.isScanning = false;
	},
}));

Alpine.start();
