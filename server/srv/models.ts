export type Signed<T> = T & {signature: string}

export interface LocationKey {
    sender_user_id: string;
    receiver_user_id: string;
    location_key: string;
    timestamp: string;
}

export interface Ping {
    user_id: string;
    encrypted_ping: string;
    timestamp: string;
}

