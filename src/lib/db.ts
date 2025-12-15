import { Context, Layer } from "effect";
import { env } from "@/lib/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
	connectionString: env.SUPABASE_DB_URL,
});

const db = drizzle(pool);

export class Db extends Context.Tag("Db")<Db, { db: typeof db }>() {}

export const DbLayer = Layer.succeed(Db, { db });
