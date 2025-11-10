import { Store as TauriStore } from "@tauri-apps/plugin-store";

type Settings = {
	server_url: string;
	user_id: string;
	friends: { name: string; id: string }[];
	is_admin: boolean;
	priv_key: string;
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

	// FOR TESTING ONLY
	async reset(): Promise<void> {
		const store = await TauriStore.load("settings.json");
		await store.reset();
		await store.save();
	},
};
