import { Store as TauriStore } from "@tauri-apps/plugin-store";
import type { ClientFriend } from "../../../shared/globalTypes";

type Settings = {
	server_url: string;
	user_id: string;
	private_key: JsonWebKey;
	friends: ClientFriend[];
	is_admin: boolean;
};

export const Store = {
	async get<T extends keyof Settings>(key: T): Promise<Settings[T] | undefined> {
		const store = await TauriStore.load("settings.json");
		// const store = await loadStore();
		// await store.reload(); // when adding this it works
		const value = await store.get<Settings[T]>(key);
		return value;
	},

	async set<T extends keyof Settings>(key: T, value: Settings[T]): Promise<void> {
		// const store = await loadStore();
		const store = await TauriStore.load("settings.json");
		await store.set(key, value);
		await store.save();
	},
};
