import type { Base64String } from "./globalTypes";

export function getBufferForSignature(data: string, nonce: Base64String, timestamp: string, user_id: string): BufferSource{
	const data_to_sign = data + nonce + timestamp + user_id;
	const buffer_to_sign = new TextEncoder().encode(data_to_sign);
	return buffer_to_sign;
}
