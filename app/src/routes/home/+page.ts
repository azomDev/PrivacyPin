import type { PageLoad } from './$types';
import { Store } from "../../utils/store";

export const load: PageLoad = async ({ params }) => {
	const user_id = await Store.get("user_id");
	const friends = await Store.get("friends");
	const is_admin = await Store.get("is_admin");
	return { user_id, friends, is_admin };
};
