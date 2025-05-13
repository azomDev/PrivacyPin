import { serializeCondition, type Condition } from "./condition.ts";
import type { Columns, getRealType } from "./schema.ts";
import { Database, type Changes } from "bun:sqlite";

export type AllSelectExpresions = "where" | "orderBy" | "limit" | "all" | "get";

export class SelectExtraQuery<Cs extends Columns, C extends Columns, _ extends AllSelectExpresions> {
	protected query: string;
	protected db: Database;

	constructor(query: string, db: Database) {
		this.query = query;
		this.db = db;
	}

	where(condition: Condition<Cs>): Omit<SelectExtraQuery<Cs, C, "orderBy" | "limit" | "all" | "get">, Exclude<AllSelectExpresions, "orderBy" | "limit" | "all" | "get">> {
		this.query += ` WHERE ${serializeCondition(condition)}`;
		return this;
	}

	orderBy<T extends keyof Cs>(clause: T): Omit<SelectExtraQuery<Cs, C, "limit" | "all" | "get">, Exclude<AllSelectExpresions, "limit" | "all" | "get">> {
		this.query += `ORDER BY ${clause as string}`;
		return this;
	}

	limit(n: number): Omit<SelectExtraQuery<Cs, C, "all" | "get">, Exclude<AllSelectExpresions, "all" | "get">> {
		this.query += `LIMIT ${n}`;
		return this;
	}

	all(): { [K in keyof C]: getRealType<C[K]["type"]> }[] | null {
		return this.db.query(this.query).all() as any;
	}

	// TODO: get alternative that only works on 1 column, it returns the value not in an object {}
	get(): { [K in keyof C]: getRealType<C[K]["type"]> } | null {
		return this.db.query(this.query).get() as any;
	}
}

export class DeleteExtraQuery<C extends Columns> {
	protected query: string;
	protected db: Database;

	constructor(query: string, db: Database) {
		this.query = query;
		this.db = db;
	}

	where(condition: Condition<C>): Omit<DeleteExtraQuery<C>, "where"> {
		this.query += ` WHERE ${serializeCondition(condition)}`;
		return this;
	}
	// {
//   lastInsertRowid: 0,
//   changes: 0,
// }
	run(): Changes {
		return this.db.query(this.query).run();
	}
}
