<script lang="ts">
	import type { PageProps } from './$types';
	import { apiRequest } from "../../utils/api.ts";
	import { showLatestFriendPing,  sendPings, appReset} from '../../utils/temp.ts';
	import { acceptFriendRequest, sendFriendRequest } from '../../utils/friends_temp.ts';

	let friend_name = $state("");
	let friend_id = $state("");

	let signup_key = $state("");
	async function generateSignupKey() {
		const response = await apiRequest("/generate-signup-key", {});
		signup_key = response.signup_key
	}

	let { data }: PageProps = $props();
</script>

<div id="home-page">
	{#if data.friends.length > 0}
		{#each data.friends as friend}
			<div>
				<span>Friend: {friend.name}</span>
				<button onclick={() => showLatestFriendPing(friend.id)}>Get Ping</button>
			</div>
		{/each}
	{:else}
		<p>You have no friends yet</p>
	{/if}

	<button onclick={sendPings}>Send Pings</button>
	<button onclick={appReset}>RESET STORE TEMPORARY</button>

	<div>
		<h3>Add Friend</h3>
		<p>Your User ID: {data.user_id}</p>
		<form>
			<div>
				<label for="friend-name">Name:</label>
				<input type="text" name="friend-name" bind:value={friend_name} required/>
				<!-- probably need id="friend-name" -->
			</div>
			<div>
				<label for="friend-id">User ID:</label>
				<input type="text" name="friend-id"  bind:value={friend_id} required/>
				<!-- probably need id="friend-id" -->
			</div>
			<div>
				<button type="button" onclick={() => sendFriendRequest(friend_name, friend_id)}>Send Friend Request</button>
				<button type="button" onclick={() => acceptFriendRequest(friend_name, friend_id)}>Accept Friend Request</button>
			</div>
		</form>
	</div>

	{#if data.is_admin}
		<button onclick={generateSignupKey}>Generate Signup Key</button>
		<p>{signup_key}</p>
	{/if}
</div>
