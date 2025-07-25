import { randomUUIDv7 } from "bun";

export class Err extends Error {
	public log_server: boolean;
	public error_code: number;

	constructor(message: string, log_server: boolean = false, error_code: number = 599) {
		super(message);
		this.name = "Err";
		this.log_server = log_server;
		this.error_code = error_code;
	}
}

export function genID(): string {
	return Math.random().toString(36).slice(2, 8); // smaller id for dev
	// return randomUUIDv7();
}
