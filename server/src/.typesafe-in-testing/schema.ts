type fakeType = "TEXT" | "INTEGER"

export type ColumnConfig<T extends fakeType> = {
    name: string;
    type: T;
};

export type getColumnsType<C extends Columns> = Prettify<{ // TODO: is Prettify needed?
    [K in keyof C]: C[K]["type"] extends "TEXT" ? string : number;
}>;

export type getRealType<T extends fakeType> = T extends "TEXT" ? string : number;

export type Columns = Record<string, ColumnConfig<fakeType>>;

export type Schema<C extends Columns, N extends string> = {
    tableName: N;
    columns: C;
};

export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

export const integer = (name: string): ColumnConfig<"INTEGER"> => ({
    name,
    type: "INTEGER",
});

export const text = (name: string): ColumnConfig<"TEXT"> => ({
    name,
    type: "TEXT",
});

export const schema = <T extends Columns, N extends string>(tableName: N, columns: T): Schema<T, N> => ({
    tableName,
    columns,
});
