import { getAllJSDocTagsOfKind } from "typescript";

export type User = {
	user_id: string;
	pub_sign_key: string;
};

export type Ping = {
	sender_id: string;
	receiver_id: string;
	encrypted_ping: string;
};

export type FriendRequest = {
	sender_id: string;
	accepter_id: string;
};

export type SignData = {
	signature: string;
	user_id: string;
};

export type Challenge = { timestamp: number; nonce: string };
