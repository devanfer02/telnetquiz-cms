import { drizzle } from "drizzle-orm/node-postgres";
import { Context, Layer } from "effect";
import { Pool } from "pg";
import { env } from "@/lib/env";
import * as schema from "../database/schema";

export type DbMode = "production" | "testing";

const createPool = (connectionString: string) =>
	new Pool({
		connectionString,
		max: 10,
		idleTimeoutMillis: 10000,
		connectionTimeoutMillis: 5000,
		keepAlive: true,
		keepAliveInitialDelayMillis: 10000,
	});

const prodPool = createPool(env.SUPABASE_DB_URL);
const testingPool = createPool(env.SUPABASE_DB_TESTING_URL);

prodPool.on("error", (err) => {
	console.error(
		"Unexpected pool error on idle client (production):",
		err.message,
	);
});
testingPool.on("error", (err) => {
	console.error("Unexpected pool error on idle client (testing):", err.message);
});

const prodDb = drizzle(prodPool, { schema });
const testingDb = drizzle(testingPool, { schema });

let currentMode: DbMode = env.NODE_ENV;

export const getDbMode = (): DbMode => currentMode;

export const setDbMode = (mode: DbMode): void => {
	if (mode !== currentMode) {
		console.info(`[db] Switching active database: ${currentMode} -> ${mode}`);
	}
	currentMode = mode;
};

export const getActiveDb = () =>
	currentMode === "testing" ? testingDb : prodDb;

// Proxy delegates every property access to the currently active drizzle
// instance, so existing `import { db } from "@/lib/db"` consumers (e.g.
// Better Auth's drizzleAdapter, auth route loaders) follow the runtime switch
// without needing to re-import.
export const db = new Proxy({} as typeof prodDb, {
	get(_target, prop) {
		const active = getActiveDb();
		const value = Reflect.get(active, prop) as unknown;
		return typeof value === "function"
			? (value as (...args: unknown[]) => unknown).bind(active)
			: value;
	},
});

export class Db extends Context.Tag("Db")<Db, { db: typeof prodDb }>() {}

export const DbLayer = Layer.sync(Db, () => ({ db: getActiveDb() }));
