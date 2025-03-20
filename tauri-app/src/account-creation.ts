import { init } from "./init.ts";
import { createAccount } from "./utils/api.ts";
import { Store } from "./utils/store.ts";

export async function handleAccountCreationForm(event: Event) {
	event.preventDefault();

	const server_url = (document.getElementById("server-url") as HTMLInputElement).value;
	const signup_key = (document.getElementById("signup-key") as HTMLInputElement).value;

	const key_pair = await crypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]);
	const pub_key = await crypto.subtle.exportKey("jwk", key_pair.publicKey);
	const priv_key = await crypto.subtle.exportKey("jwk", key_pair.privateKey);

	const { user_id, is_admin } = await createAccount(server_url, {
		pub_sign_key: pub_key,
		signup_key,
	});

	await Store.set("server_url", server_url);
	await Store.set("is_admin", is_admin);
	await Store.set("user_id", user_id);
	await Store.set("private_key", priv_key);

	// Show home
	document.getElementById("account-creation-page")!.style.display = "none";
	document.getElementById("home-page")!.style.display = "block";
	init();
}
