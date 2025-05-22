import { isSignatureValid } from "./auth.ts";
import { HTTPServer } from "@privacypin/shared";
import { CONFIG } from "./config.ts";
import * as RH from "./request-handler";
import { randomUUIDv7 } from "bun";
import { initServer } from "./request-handler";

await initServer();
console.log(`http://127.0.0.1:${CONFIG.PORT}`);

// todo do we need runtime input request validation?
// todo sign data header typesafety and runtime validation?

// todo use this function, mabye add in the http api types an option to tell if the api is restricted to the admin
export async function isAdmin(user_id: string): Promise<boolean> {
	const admin_file = Bun.file(CONFIG.ADMIN_ID_PATH);
	const admin_id = await admin_file.text();
	return user_id === admin_id;
}

HTTPServer({
	port: CONFIG.PORT,
	signatureVerification: isSignatureValid,
	handlers: {
		"/create-account": {
			process: ({signup_key, pub_sign_key}) => {
				return RH.createAccount(signup_key, pub_sign_key);
			},
		},
		"/generate-signup-key": {
			process: () => {
				return RH.generateSignupKey();
			},
		},
		"/create-friend-request": {
			check: (user_id, { sender_id, accepter_id }) => {
				return user_id === sender_id;
			},
			process: (friend_request) => {
				RH.createFriendRequest(friend_request);
			},
		},
		"/accept-friend-request": {
			check: (user_id, { sender_id, accepter_id }) => {
				return user_id === accepter_id;
			},
			process: (friend_request) => {
				RH.acceptFriendRequest(friend_request);
			},
		},
		"/is-friend-request-accepted": {
			check: (user_id, { sender_id, accepter_id }) => {
				return user_id === sender_id;
			},
			process: (friend_request) => {
				return RH.isFriendRequestAccepted(friend_request);
			},
		},
		"/send-pings": {
			check: (user_id, { pings }) => {
				return pings.every((ping) => ping.sender_id === user_id);
			},
			process: ({ pings }) => {
				RH.sendPings(pings);
			},
		},
		"/get-pings": {
			check: (user_id, { receiver_id }) => {
				return user_id === receiver_id;
			},
			process: ({ sender_id, receiver_id }) => {
				return RH.getPings(sender_id, receiver_id);
			},
		},
	},
});
