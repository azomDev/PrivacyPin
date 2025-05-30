<script lang="ts">
	import { Store } from "../utils/store";
	import { goto } from '$app/navigation';
	import "../app.css";
	//import { Switch } from "m3-svelte";

	(async () => {
		const is_logged_in = await Store.isLoggedIn();
		if (!is_logged_in) {
			await goto("/create-account");
		} else {
			await goto("/home");
		}
	})();

	//let darkTheme = $state(true);
</script>
<!-- <Switch bind:checked={darkTheme}/> -->