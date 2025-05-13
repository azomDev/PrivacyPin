import type { Columns, Schema } from "./schema.ts";
import { Table } from "./table.ts";
import { Database } from "bun:sqlite";

export class TypesafeDB<Ss extends readonly Schema<Columns, string>[]> {
	private db: Database;
	private schemas: Ss;

	constructor(database_file_path: string, schemas: Ss) {
		// TODO
		// 	db = new Database(CONFIG.DATABASE_PATH, { create: true, strict: true });
		// db.run(`
		// 	CREATE TABLE IF NOT EXISTS positions (
		// 		sender_id TEXT,
		// 		receiver_id TEXT,
		// 		encrypted_ping TEXT, -- in base64 when encrypted mabye? todo
		// 		recency_index INTEGER PRIMARY KEY AUTOINCREMENT,
		// 		UNIQUE(sender_id, receiver_id, recency_index)
		// 	)
		// `);
		this.db = new Database(database_file_path);
		this.schemas = schemas;
	}

	table<T extends Ss[number]["tableName"]>(table_name: T): Table<Extract<Ss[number], { tableName: T }>["columns"]> {
		return new Table(this.schemas.find(s => (s.tableName === table_name))!, this.db);
	}
}
