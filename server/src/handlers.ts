import * as RH from "./request-handler";

import { type APIRoutes } from "../../shared/apiTypes";

type HandlerConfig<K extends keyof APIRoutes> = {
	auth: boolean;
	check?: (user_id: string, input: APIRoutes[K]["input"]) => boolean;
	process: (input: APIRoutes[K]["input"]) => APIRoutes[K]["output"];
};

export type Handlers = {
	[K in keyof APIRoutes]: HandlerConfig<K>;
};

// todo, you can only define check if auth is true?

// todo put auth boolean and stuff like that in shared

export const handlers: Handlers = {
	"/create-account": {
		auth: false,
		process: ({ signup_key, pub_sign_key }) => {
			return RH.createAccount(signup_key, pub_sign_key);
		},
	},
	"/generate-signup-key": {
		auth: true,
		process: () => {
			return RH.generateSignupKey();
		},
	},
	"/create-friend-request": {
		auth: true,
		process: (friend_request) => {
			RH.createFriendRequest(friend_request);
		},
	},
	"/accept-friend-request": {
		auth: true,
		process: (friend_request) => {
			RH.acceptFriendRequest(friend_request);
		},
	},
	"/is-friend-request-accepted": {
		auth: true,
		process: (friend_request) => {
			return RH.isFriendRequestAccepted(friend_request);
		},
	},
	"/send-pings": {
		auth: true,
		check: (user_id, { pings }) => {
			return pings.every((ping) => ping.sender_id === user_id);
		},
		process: ({ pings }) => {
			RH.sendPings(pings);
		},
	},
	"/get-pings": {
		auth: true,
		check: (user_id, { receiver_id }) => {
			return user_id === receiver_id;
		},
		process: ({ sender_id, receiver_id }) => {
			return RH.getPings(sender_id, receiver_id);
		},
	},
};
