export type WithoutId<T> = Omit<T, "id">

export interface User {
    id: string;
    username: string;
}

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

export type SQLiteLink = Omit<Link, "is_user_1_sending" | "is_user_2_sending"> & {
    is_user_1_sending: number;
    is_user_2_sending: number;
};

export const mapLinkFromDb = (dbRow: SQLiteLink): Link => ({
    ...dbRow,
    is_user_1_sending: Boolean(dbRow.is_user_1_sending),
    is_user_2_sending: Boolean(dbRow.is_user_2_sending),
});
