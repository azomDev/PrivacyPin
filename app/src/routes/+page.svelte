<script lang="ts">
	import { Store } from "../utils/store";
	import { goto } from '$app/navigation';

	(async () => {
		const is_logged_in = await Store.isLoggedIn();
		if (!is_logged_in) {
			goto("/create-account");
		} else {
			goto("/home");
		}
	})();
</script>
