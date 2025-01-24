import { Database } from "bun:sqlite";

const db = new Database("mydb.sqlite", { create: true });

export function get_db_message() {
	const query = db.query("select 'Hello world' as message;");
	return query.get();
}
