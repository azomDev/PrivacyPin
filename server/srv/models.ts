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
    is_user_1_sending: number;
    is_user_2_sending: number;
}

export interface FrontendLink {
    id: string;
    receiver_user_id: string;
    am_i_sending: number;
}

export const mapLinkToFrontendLink = (link: Link, user_id: string): FrontendLink => {
    return {
        id: link.id,
        receiver_user_id: ((user_id === link.user_id_1) ? link.user_id_2 : link.user_id_1),
        am_i_sending: ((user_id === link.user_id_1) ? link.is_user_1_sending : link.is_user_2_sending),
    };
};
