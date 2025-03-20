import { EncryptedPing, ServerPing } from "./globalTypes";

// todo remove export
export type CreateAccountPayload = {
	signup_key: string;
	pub_sign_key: JsonWebKey;
};
// todo remove export
export type CreateAccountResponse = {
	user_id: string;
	is_admin: boolean;
};

type SendPingPayload = {
	pings: ServerPing[];
};
type SendPingsResponse = void;

type GenerateSignupKeyPayload = null;
type GenerateSignupKeyResponse = {
	signup_key: string;
};

type CreateFriendRequestPayload = {
	sender_id: string;
	accepter_id: string;
};
type CreateFriendRequestResponse = void;

type AcceptFriendRequestPayload = {
	sender_id: string;
	accepter_id: string;
};
type AcceptFriendRequestResponse = void;

type IsFriendRequestAcceptedPayload = {
	sender_id: string;
	accepter_id: string;
};
type IsFriendRequestAcceptedResponse = {
	accepted: boolean;
};

type GetPingsPayload = {
	sender_id: string;
	receiver_id: string;
};
type GetPingsResponse = {
	pings: EncryptedPing[];
};

export type APIRoutes = {
	// We don't define create-account here since it's special as it does not need auth
	"/create-account": {
		input: CreateAccountPayload;
		output: CreateAccountResponse;
	};
	"/create-friend-request": {
		input: CreateFriendRequestPayload;
		output: CreateFriendRequestResponse;
	};
	"/accept-friend-request": {
		input: AcceptFriendRequestPayload;
		output: AcceptFriendRequestResponse;
	};
	"/is-friend-request-accepted": {
		input: IsFriendRequestAcceptedPayload;
		output: IsFriendRequestAcceptedResponse;
	};
	"/get-pings": {
		input: GetPingsPayload;
		output: GetPingsResponse;
	};
	"/generate-signup-key": {
		input: GenerateSignupKeyPayload;
		output: GenerateSignupKeyResponse;
	};
	"/send-pings": {
		input: SendPingPayload;
		output: SendPingsResponse;
	};
};
