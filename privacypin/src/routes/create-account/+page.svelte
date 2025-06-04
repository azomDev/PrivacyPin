<script lang="ts">
    import { goto } from "$app/navigation";
	import { apiRequest } from "../../utils/api.ts";
	import { Store } from "../../utils/store.ts";
	import "../../app.css";
	import { TextField, Button } from "m3-svelte";

	let server_url = $state("");
	let signup_key = $state("");

	function formatServerURL() {
		if (server_url.indexOf('://') !> -1) {
			let isHTTPS = server_url.toLowerCase().startsWith("https://");
			let isHTTP = server_url.toLowerCase().startsWith("http://");

			if(isHTTP) {} else if(isHTTPS) {
				server_url = server_url.split("https://").join("http://");
			} else {
				server_url = "http://" + server_url
			}
		}
	}

	async function createAccount(event: SubmitEvent) {

		formatServerURL();

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

		await goto("/home");
	}
</script>

<div id="account-creation-page" >
	<h1>Create an Account</h1>

	<form onsubmit={createAccount}>
		<p>Server URL:</p>
		<TextField name="Enter the server URL" bind:value={server_url} required />
		<p>Signup Key:</p>
		<TextField name="Enter the signup key" bind:value={signup_key} required />
		<br>
		<Button variant="filled" click={() => "" } type="submit" >Create Account</Button>
	</form>
</div>
