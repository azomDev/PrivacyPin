import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";

function AccountCreation() {
	const navigate = useNavigate();
	const [signupKey, setSignupKey] = createSignal("");
	const [pubSignKey, setPubSignKey] = createSignal("");

	const handleSubmit = async (e) => {
		e.preventDefault();

		const response = await fetch("http://localhost:8080/create-account", {
			method: "POST",
			body: JSON.stringify({
				signup_key: signupKey(),
				pub_sign_key: pubSignKey(),
			}),
		});

		if (response.ok) {
			const user_id = await response.text();
			localStorage.setItem("user_id", user_id);
			navigate("/account-created");
		} else {
			console.error("Account creation failed");
		}
	};

	return (
		<div class="min-h-screen flex justify-center items-center">
			<form onSubmit={handleSubmit} class="bg-white p-8 rounded shadow-md w-96">
				<h1 class="text-xl mb-4">Create Account</h1>
				<div class="mb-4">
					<label for="signup_key" class="block">
						Signup Key
					</label>
					<input
						type="text"
						id="signup_key"
						value={signupKey()}
						onInput={(e) => setSignupKey(e.target.value)}
						class="w-full p-2 border rounded"
						required
					/>
				</div>
				<div class="mb-4">
					<label for="pub_sign_key" class="block">
						Public Sign Key
					</label>
					<input
						type="text"
						id="pub_sign_key"
						value={pubSignKey()}
						onInput={(e) => setPubSignKey(e.target.value)}
						class="w-full p-2 border rounded"
						required
					/>
				</div>
				<button type="submit" class="w-full bg-blue-500 text-white p-2 rounded">
					Create Account
				</button>
			</form>
		</div>
	);
}

export default AccountCreation;
