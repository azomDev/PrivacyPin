<script lang="ts">
	let {children} = $props();
	import "../app.css";
	import { Dialog, Button, Tabs } from "m3-svelte";
	import { toastOpen, toastTitle, toastMessage } from "../utils/toast";


	let tab: string = $state("home");

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

<Dialog headline={$toastTitle} bind:open={$toastOpen}>
	{$toastMessage}
	{#snippet buttons()}
		<Button variant="tonal" click={() => $toastOpen = false}>OK</Button>
	{/snippet}
</Dialog>


{@render children()}
