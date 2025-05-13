
import { integer, schema, text } from "./schema.ts";
import { TypesafeDB } from "./db.ts";
import { eq, and } from "./condition.ts";

const users = schema("users", {
    id: integer("id"),
    username: text("username"),
});

const asdf = schema("asdf", {
    wer: integer("wer"),
    qwe: text("qwe"),
});

const db = new TypesafeDB("test.sqlite", [users, asdf]);
const aUser = { id: 123, username: "hoi" };

const anotherUser = { id: 678, username: "aaa" };
const anotherUser2 = { id: 123.5, username: "1111" };

// db.table(users).insert(anotherUser, anotherUser2).execute();
// // db.table(users).insert([anotherUser, anotherUser2], []).execute();
db.table("users").insert([anotherUser, anotherUser2]).run();
db.table("users").delete().where(and(and(eq("id", "5"), eq("id", 1)), eq("username", "1")))
// db.table("asdf").insert(anotherUser, anotherUser2).execute();
// db.table(users).update({id: 234, username: "hoi"})


// // db.table(users).insert(anotherUser).execute();

// db.table(users).select(asdf.columns.qwe).where("id = 678").execute()
// // db.table(users).select(users.columns.id).where("id = 678").orderBy(id)
