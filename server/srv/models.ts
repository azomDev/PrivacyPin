export interface User {
    id: string;
    username: string;
}

export type WithoutId<T> = Omit<T, "id">

export interface Ping {
    id: string;
    user_id: string;
    longitude: number;
    latitude: number;
    timestamp: number;
}

export interface Link {
    id: string;
    sender_id: string;
    receiver_id: string;
    is_link_active: boolean;
}
