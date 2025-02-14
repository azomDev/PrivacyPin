export type User = {
	user_id: string;
	pub_sign_key: Uint8Array;
};

export type Ping = {
	sender_id: string;
	receiver_id: string;
	encrypted_ping: Uint8Array;
};

export type FriendRequest = {
	sender_id: string;
	accepter_id: string;
};

export type SignData = {
	signature: Uint8Array;
	user_id: string;
};

export type Challenge = {
	timestamp: number;
	nonce: string;
};
