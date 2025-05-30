<script lang="ts">
	let {children} = $props();
	import "../app.css";
</script>

<nav>
	<a href="home">Home</a> <!-- Leaving these here for now so I can test the UI changes :) ~Kit -->
	<a href="create-account">Create Account</a>
</nav>

{@render children()}