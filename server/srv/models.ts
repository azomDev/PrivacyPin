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

export interface FrontendLink {
    id: string;
    receiver_user_id: string;
    am_i_sending: boolean;
}

export const mapFrontendLinkFromDb = (dbRow: SQLiteLink, user_id: string): FrontendLink => {
    if (user_id === dbRow.user_id_1) {
        console.log("test")
        return {
            id: dbRow.id,
            receiver_user_id: dbRow.user_id_2,
            am_i_sending: Boolean(dbRow.is_user_1_sending),
        };
    } else if (user_id === dbRow.user_id_2) {
        return {
            id: dbRow.id,
            receiver_user_id: dbRow.user_id_1,
            am_i_sending: Boolean(dbRow.is_user_2_sending),
        };
    }
    else {
        throw new Error("Invalid user_id");
    }
};
