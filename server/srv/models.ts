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
    user_id_1: string;
    user_id_2: string;
    is_user_1_sending: boolean;
    is_user_2_sending: boolean;
}
