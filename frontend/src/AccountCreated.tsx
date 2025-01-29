import { createEffect } from "solid-js";

function AccountCreated() {
	createEffect(() => {
		const userId = localStorage.getItem("user_id");
		if (userId) {
			console.log("Account created successfully for user ID:", userId);
		}
	});

	return (
		<div class="min-h-screen flex justify-center items-center">
			<div class="bg-white p-8 rounded shadow-md w-96">
				<h1 class="text-xl mb-4">Account Created Successfully!</h1>
				<p>Your account has been created.</p>
			</div>
		</div>
	);
}

export default AccountCreated;
