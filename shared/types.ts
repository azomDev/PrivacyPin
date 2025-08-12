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
export const CreateAccountInputZod = z.object({
	signup_key: z.string(),
});
export type CreateAccountInput = z.infer<typeof CreateAccountInputZod>;

export const CreateAccountOutputZod = z.object({
	user_id: z.string(),
	is_admin: z.boolean(),
});
export type CreateAccountOutput = z.infer<typeof CreateAccountOutputZod>;

// ---------- generateSignupKey ----------
export const GenerateSignupKeyInputZod = z.undefined();
export type GenerateSignupKeyInput = z.infer<typeof GenerateSignupKeyInputZod>;

export const GenerateSignupKeyOutputZod = z.object({
	signup_key: z.string(),
});
export type GenerateSignupKeyOutput = z.infer<typeof GenerateSignupKeyOutputZod>;

// ---------- createFriendRequest ----------
export const FriendRequestZod = z.object({
	sender_id: z.string(),
	accepter_id: z.string(),
});
export type FriendRequest = z.infer<typeof FriendRequestZod>;

export const CreateFriendRequestInputZod = FriendRequestZod;
export type CreateFriendRequestInput = z.infer<typeof CreateFriendRequestInputZod>;

export const CreateFriendRequestOutputZod = z.void();
export type CreateFriendRequestOutput = z.infer<typeof CreateFriendRequestOutputZod>;

// ---------- acceptFriendRequest ----------
export const AcceptFriendRequestInputZod = FriendRequestZod;
export type AcceptFriendRequestInput = z.infer<typeof AcceptFriendRequestInputZod>;

export const AcceptFriendRequestOutputZod = z.void();
export type AcceptFriendRequestOutput = z.infer<typeof AcceptFriendRequestOutputZod>;

// ---------- isFriendRequestAccepted ----------
export const IsFriendRequestAcceptedInputZod = FriendRequestZod;
export type IsFriendRequestAcceptedInput = z.infer<typeof IsFriendRequestAcceptedInputZod>;

export const IsFriendRequestAcceptedOutputZod = z.object({
	accepted: z.boolean(),
});
export type IsFriendRequestAcceptedOutput = z.infer<typeof IsFriendRequestAcceptedOutputZod>;

// ---------- sendPings ----------
export const ServerPingZod = z.object({
	sender_id: z.string(),
	receiver_id: z.string(),
	encrypted_ping: z.string(),
});
export type ServerPing = z.infer<typeof ServerPingZod>;

export const SendPingsInputZod = z.array(ServerPingZod);
export type SendPingsInput = z.infer<typeof SendPingsInputZod>;

export const SendPingsOutputZod = z.void();
export type SendPingsOutput = z.infer<typeof SendPingsOutputZod>;

// ---------- getPings ----------
export const GetPingsInputZod = z.object({
	sender_id: z.string(),
	receiver_id: z.string(),
});
export type GetPingsInput = z.infer<typeof GetPingsInputZod>;

export const GetPingsOutputZod = z.object({
	pings: z.array(z.string()),
});
export type GetPingsOutput = z.infer<typeof GetPingsOutputZod>;
