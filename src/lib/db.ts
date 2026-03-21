import { drizzle } from "drizzle-orm/node-postgres";
import { Context, Layer } from "effect";
import { Pool } from "pg";
import { env } from "@/lib/env";
import * as schema from "../database/schema";

const pool = new Pool({
	connectionString: env.SUPABASE_DB_URL,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool, { schema });

export class Db extends Context.Tag("Db")<Db, { db: typeof db }>() {}

export const DbLayer = Layer.succeed(Db, { db });
