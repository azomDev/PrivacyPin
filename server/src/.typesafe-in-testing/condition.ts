import type { Columns, getColumnsType } from "./schema";

export type EqExpr<C extends Columns, K extends keyof C> = {
	kind: "eq";
	column: K;
	value: getColumnsType<C>[K];
};

export type AndExpr<C extends Columns> = {
	kind: "and";
	left: Condition<C>;
	right: Condition<C>;
};

export type Condition<C extends Columns> = EqExpr<C, keyof C> | AndExpr<C>;

export function eq<
	C extends Columns,
	K extends keyof C
>(column: K, value: getColumnsType<C>[K]): EqExpr<C, K> {
	return { kind: "eq", column, value };
}

export function and<C extends Columns>(
	left: Condition<C>,
	right: Condition<C>
): AndExpr<C> {
	return { kind: "and", left, right };
}

export function serializeCondition<C extends Columns>(cond: Condition<C>): string {
	switch (cond.kind) {
	case "eq":
		return `${String(cond.column)} = ${JSON.stringify(cond.value)}`;
	case "and":
		return `(${serializeCondition(cond.left)} AND ${serializeCondition(cond.right)})`;
	}
}
