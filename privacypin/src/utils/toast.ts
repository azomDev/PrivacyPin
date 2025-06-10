import { writable } from "svelte/store";

export const toastOpen = writable(false);
export const toastTitle = writable("");
export const toastMessage = writable("");

export function showToast(title: string, message: string) {
	toastTitle.set(title);
	toastMessage.set(message);
	toastOpen.set(true);
}
