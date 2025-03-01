/**
 * Bun TypeScript typings fix for Uint8Array methods.
 *
 * Issue: https://github.com/oven-sh/bun/issues/16062
 *
 * Description:
 * Bun currently does not provide TypeScript definitions for the following methods on Uint8Array:
 * - `toBase64()`: Converts the Uint8Array to a base64 encoded string.
 * - `fromBase64()`: A static method to create a new Uint8Array from a base64 encoded string.
 *
 * This file extends the global `Uint8Array` interface to add those missing methods to avoid TypeScript errors.
 *
 * Note:
 * If Bun fixes this issue in future updates, this file can be removed.
 */

declare global {
	interface Uint8Array {
		toBase64(): string;
	}

	interface Uint8ArrayConstructor {
		fromBase64(base64: string): Uint8Array;
	}
}
