<script lang="ts">
    import { goto } from "$app/navigation";
	import { apiRequest } from "../../utils/api.ts";
	import { Store } from "../../utils/store.ts";

	let server_url = $state("");
	let signup_key = $state("");

	async function createAccount(event: SubmitEvent) {
		event.preventDefault(); // is this needed?

		const key_pair = await crypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]);
		const pub_sign_key = await crypto.subtle.exportKey("jwk", key_pair.publicKey);
		const priv_sign_key = await crypto.subtle.exportKey("jwk", key_pair.privateKey);

		Store.set("server_url", server_url);

		const { user_id, is_admin } = await apiRequest("/create-account", { pub_sign_key, signup_key });

		Store.set("user_id", user_id);
		Store.set("is_admin", is_admin);
		Store.set("friends", []);
		Store.set("private_key", priv_sign_key);

		goto("/home");
	}
</script>

<div id="account-creation-page">
	<h1>Create an Account</h1>
	<form onsubmit={createAccount}>
		<div>
			<label for="server-url">Server URL:</label>
			<input type="text" name="server-url" placeholder="Enter the server URL" bind:value={server_url} required />
			<!-- probably need id="server-url" -->
		</div>

		<div>
			<label for="signup-key">Signup Key:</label>
			<input type="text" name="signup-key" placeholder="Enter your signup key" bind:value={signup_key} required />
			<!-- probably need id="signup-key" -->
		</div>

		<button type="submit">Create Account</button>
	</form>
</div>
