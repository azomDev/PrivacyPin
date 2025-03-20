export function getBufferForSignature(data: string, nonce: string, timestamp: string, user_id: string): Uint8Array<ArrayBufferLike> {
	const data_to_sign = data + nonce + timestamp + user_id;
	const buffer_to_sign = new TextEncoder().encode(data_to_sign);
	return buffer_to_sign;
}
