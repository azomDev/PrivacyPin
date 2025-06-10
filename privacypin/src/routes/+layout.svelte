<script lang="ts">
	let {children} = $props();
	import "../app.css";
	import { Dialog, Button, Tabs } from "m3-svelte";

	let tab: string = $state("home");

	let open: boolean = $state(false);
	let toastTitle: string = $state("");
	let toastMessage: string = $state("");

	export function showToast(title: string, message: string) {
		toastTitle = title;
		toastMessage = message;
		open = true;
	}

</script>

<nav>
	<Tabs
		items={[
    { name: "Home", value: "/home" },
    { name: "Create Account", value: "/create-account" },
  ]}
		bind:tab
	/>
</nav>

<a href="{tab}" >Load page</a>

<Dialog headline={toastTitle} bind:open>
	{toastMessage}
	{#snippet buttons()}
		<Button variant="tonal" click={() => (open = false)}>OK</Button>
	{/snippet}
</Dialog>

{@render children()}