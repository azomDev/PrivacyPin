export type Signed<T> = T & { signature: string };

export interface Ping {
    receiver_user_id: string;
    sender_user_id: string;
    encrypted_ping: string;
    timestamp: string;
}

export const resetColor = "\x1b[0m";
export const redColor = "\x1b[31m";
