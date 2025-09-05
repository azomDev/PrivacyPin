import { Store as TauriStore } from "@tauri-apps/plugin-store";
import type { ClientFriend } from "./types";

type Settings = {
	server_url: string;
	user_id: string;
	// private_key: JsonWebKey;
	friends: ClientFriend[];
	is_admin: boolean;
};

export const Store = {
	async get<T extends keyof Settings>(key: T): Promise<Settings[T]> {
		const store = await TauriStore.load("settings.json");
		const value = await store.get<Settings[T]>(key);
		if (value === undefined) {
			alert(`Key ${key} not found in store`);
			throw new Error(`Key ${key} not found in store`);
		}
		return value;
	},

	async set<T extends keyof Settings>(key: T, value: Settings[T]): Promise<void> {
		const store = await TauriStore.load("settings.json");
		await store.set(key, value);
		await store.save();
	},

	async isLoggedIn(): Promise<boolean> {
		const store = await TauriStore.load("settings.json");
		const user_id = await store.get<string>("user_id");
		return user_id !== undefined;
	},
};
