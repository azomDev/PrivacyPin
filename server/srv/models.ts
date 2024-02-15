export type WithoutId<T> = Omit<T, "id">
export type Signed<T> = T & {signature: string}

export interface ServerUser {
    id: string;
}

export interface Ping {
    user_id: string;
    encrypted_ping: string;
    timestamp: string;
}

export interface LocationKey {
    user_id: string;
    location_key: string;
    timestamp: string;
}