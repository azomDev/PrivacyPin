<script lang="ts">
	import { Store } from '../utils/store';
	import { goto } from '$app/navigation';
	import  '../app.reversed.css'

	(async () => {
		const is_logged_in = await Store.isLoggedIn();
		if (!is_logged_in) {
			await goto("/create-account");
		} else {
			await goto("/home");
		}
	})();

</script>