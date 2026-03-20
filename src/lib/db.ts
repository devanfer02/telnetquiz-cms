import { drizzle } from "drizzle-orm/node-postgres";
import { Context, Layer } from "effect";
import { Pool } from "pg";
import { env } from "@/lib/env";
import * as schema from "../database/schema";

const pool = new Pool({
	connectionString: env.SUPABASE_DB_URL,
});

export const db = drizzle(pool, { schema });

export class Db extends Context.Tag("Db")<Db, { db: typeof db }>() {}

export const DbLayer = Layer.succeed(Db, { db });
