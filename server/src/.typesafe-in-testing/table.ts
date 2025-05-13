import { Database } from "bun:sqlite";
import type { Columns, getColumnsType, Schema } from "./schema.ts";
import  { type AllSelectExpresions, DeleteExtraQuery, SelectExtraQuery } from "./extra_query.ts";

export class Table<C extends Columns> {
	private tableName: string;
	private columns: Columns;
	private db: Database;

	constructor(schema: Schema<C, string>, db: Database) {
		this.tableName = schema.tableName;
		this.columns = schema.columns;
		this.db = db;
	}

	isEmpty(): boolean {
		const query = this.db.query(`SELECT EXISTS(SELECT 1 FROM ${this.tableName} LIMIT 1) AS exists`);
		const result = query.get() as { exists: 0 | 1 };
		return result.exists === 0;
	}

	insert<T extends getColumnsType<C>>(input: T | T[]): { run: () => void } {
		const valuesArray = Array.isArray(input) ? input : [input];

		const columnNames = Object.keys(this.columns);
		const placeholders = columnNames.map(() => "?").join(", ");
		const insertQuery = `INSERT INTO ${this.tableName} (${columnNames.join(", ")}) VALUES (${placeholders})`;
		const insertStmt = this.db.prepare(insertQuery);

		const run = () => {
			if (valuesArray.length > 1) {
				this.db.transaction(() => {
					for (const obj of valuesArray) {
						const values = columnNames.map((columnName) => obj[columnName as keyof C]);
						insertStmt.run(...values);
					}
				})();
			} else {
				const values = columnNames.map(col => valuesArray[0]![col as keyof C]);
				insertStmt.run(...values);
			}
		};

		return { run };
	}

	select(): SelectExtraQuery<C, C, AllSelectExpresions>;
	select<T extends keyof C>(column_name: T): SelectExtraQuery<C, Pick<C, T>, AllSelectExpresions>;
	select(column_name?: keyof C): SelectExtraQuery<C, any, AllSelectExpresions> {
		let select_query;
		if (column_name === undefined) {
			select_query = `SELECT * FROM ${this.tableName}`;
		} else {
			select_query = `SELECT ${column_name as string} FROM ${this.tableName}`
		}
		return new SelectExtraQuery(select_query, this.db);
	}

    delete(): DeleteExtraQuery<C> {
        return new DeleteExtraQuery(`DELETE FROM ${this.tableName}`, this.db);
    }
}
