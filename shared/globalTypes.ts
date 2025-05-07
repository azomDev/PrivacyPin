export type ServerUser = {
	user_id: string;
	pub_sign_key: Base64String; // todo when db will be typesafe, change this to JsonWebKey
};

export type ServerPing = {
	sender_id: string;
	receiver_id: string;
	encrypted_ping: ClientEncryptedPing;
};

export type GlobalFriendRequest = {
	sender_id: string;
	accepter_id: string;
};

export type GlobalSignData = {
	user_id: string;
	nonce: string;
	signature: Base64String;
	timestamp: string;
};

export type ClientFriend = {
	name: string;
	id: string;
	// symmetric_key: JsonWebKey;
};

export type ClientEncryptedPing = string;
export type Base64String = string;
