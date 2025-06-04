<script lang="ts">
	import type { PageProps } from './$types';
	import { apiRequest } from '../../utils/api.ts';
	import { showLatestFriendPing,  sendPings, appReset} from '../../utils/temp.ts';
	import { acceptFriendRequest, sendFriendRequest, canSendNew } from '../../utils/friends-temp.ts';
	import { Button, TextField, Snackbar } from 'm3-svelte';

	let friend_name = $state("");
	let friend_id = $state("");

	let signup_key = $state("");
	async function generateSignupKey() {
		const response = await apiRequest("/generate-signup-key", {});
		signup_key = response.signup_key
	}

	function sendFriendRequestPre(name: string, id: string) {
		if ( friend_name != "" && friend_id != "" && canSendNew() === true ) {
			sendFriendRequest(name, id);
		}
	}

	let { data }: PageProps = $props();

	let snackbar: ReturnType<typeof Snackbar>
</script>

<div id="home-page" >
	{#if data.friends.length > 0}
		{#each data.friends as friend}
			<div>
				<span>Friend: {friend.name}</span>
				<Button variant="filled" click={() => showLatestFriendPing(friend.id)}>Get Ping</Button>
			</div>
		{/each}
	{:else}
		<h1>Friends</h1>
		<p>You have no friends yet</p>
	{/if}

	<Button click={sendPings}>Send Pings</Button>
	<Button click={appReset}>Reset Store Temporary</Button>

	<div>
		<br><h3>Send Requests</h3>
		<p>Your User ID: {data.user_id}</p>
		<form>
			<div>
				<p>Name:</p>
				<TextField name="Name:" bind:value={friend_name} required />
				<!-- probably need id="friend-name" -->

				<p>User ID:</p>
				<TextField name="User ID:" bind:value={friend_id} required />
				<!-- probably need id="friend-id" -->

				<br><Button variant="filled" click={() => sendFriendRequestPre(friend_name, friend_id)}>Send Friend Request</Button>
			</div>
		</form>
	</div>

	<h3>Receive Requests</h3>
	<p>Your User ID: {data.user_id}</p>
	<Button variant="filled" click={() => acceptFriendRequest(friend_name, friend_id)}>Accept Friend Request</Button>


	{#if data.is_admin}
		<Button variant="filled" click={() => generateSignupKey()}>Generate Signup Key</Button>
		<p>{signup_key}</p>
	{/if}
</div>
