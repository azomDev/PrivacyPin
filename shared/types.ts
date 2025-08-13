import z, { ZodType } from "zod";

export type IDKYET<T> = {
	auth: {
		user_id: string,
		// more will be added later with actual signature auth
	},
	data: string, // JSON stringified
}

export type ServerUser = {
	user_id: string;
	// at some point add pub key
};

// export type ServerPing = {
// 	sender_id: string;
// 	receiver_id: string;
// 	encrypted_ping: ClientEncryptedPing;
// };

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

// ---------- createAccount ----------
export const CreateAccountRequestZod = z.object({
	signup_key: z.string(),
});
export type CreateAccountRequest = z.infer<typeof CreateAccountRequestZod>;

export const CreateAccountResponseZod = z.object({
	user_id: z.string(),
	is_admin: z.boolean(),
});
export type CreateAccountResponse = z.infer<typeof CreateAccountResponseZod>;

// ---------- generateSignupKey ----------
export const GenerateSignupKeyRequestZod = z.undefined();
export type GenerateSignupKeyRequest = z.infer<typeof GenerateSignupKeyRequestZod>;

export const GenerateSignupKeyResponseZod = z.object({
	signup_key: z.string(),
});
export type GenerateSignupKeyResponse = z.infer<typeof GenerateSignupKeyResponseZod>;

// ---------- createFriendRequest ----------
export const FriendRequestZod = z.object({
	sender_id: z.string(),
	accepter_id: z.string(),
});
export type FriendRequest = z.infer<typeof FriendRequestZod>;

export const CreateFriendRequestRequestZod = FriendRequestZod;
export type CreateFriendRequestRequest = z.infer<typeof CreateFriendRequestRequestZod>;

export const CreateFriendRequestResponseZod = z.void();
export type CreateFriendRequestResponse = z.infer<typeof CreateFriendRequestResponseZod>;

// ---------- acceptFriendRequest ----------
export const AcceptFriendRequestRequestZod = FriendRequestZod;
export type AcceptFriendRequestRequest = z.infer<typeof AcceptFriendRequestRequestZod>;

export const AcceptFriendRequestResponseZod = z.void();
export type AcceptFriendRequestResponse = z.infer<typeof AcceptFriendRequestResponseZod>;

// ---------- isFriendRequestAccepted ----------
export const IsFriendRequestAcceptedRequestZod = FriendRequestZod;
export type IsFriendRequestAcceptedRequest = z.infer<typeof IsFriendRequestAcceptedRequestZod>;

export const IsFriendRequestAcceptedResponseZod = z.object({
	accepted: z.boolean(),
});
export type IsFriendRequestAcceptedResponse = z.infer<typeof IsFriendRequestAcceptedResponseZod>;

// ---------- sendPings ----------
export const ServerPingZod = z.object({
	sender_id: z.string(),
	receiver_id: z.string(),
	encrypted_ping: z.string(),
});
export type ServerPing = z.infer<typeof ServerPingZod>;

export const SendPingsRequestZod = z.array(ServerPingZod);
export type SendPingsRequest = z.infer<typeof SendPingsRequestZod>;

export const SendPingsResponseZod = z.void();
export type SendPingsResponse = z.infer<typeof SendPingsResponseZod>;

// ---------- getPings ----------
export const GetPingsRequestZod = z.object({
	sender_id: z.string(),
	receiver_id: z.string(),
});
export type GetPingsRequest = z.infer<typeof GetPingsRequestZod>;

export const GetPingsResponseZod = z.object({
	pings: z.array(z.string()),
});
export type GetPingsResponse = z.infer<typeof GetPingsResponseZod>;


// auth data

export const ASDF = z.object({
	auth: z.optional(z.object({
		user_id: z.string(),
	})),
	data: z.unknown()
});
