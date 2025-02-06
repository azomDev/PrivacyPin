export type User = {
	user_id: string;
	pub_sign_key: string; // encoded in base64
	last_action_timestamp: number;
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
