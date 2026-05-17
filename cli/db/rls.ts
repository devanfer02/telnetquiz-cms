import { readFileSync } from "node:fs";
import { join } from "node:path";
import { sql } from "drizzle-orm";
import { db, getDbMode, setDbMode } from "../../src/lib/db";
import { env } from "../../src/lib/env";

const SCHEMA_PATH = join(import.meta.dir, "../../src/database/schema.ts");

function maskDbUrl(url: string): string {
	return url.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:****@");
}

function parseTableNames(): string[] {
	const content = readFileSync(SCHEMA_PATH, "utf-8");
	const regex = /pgTable\(\s*["']([^"']+)["']/g;
	const tables: string[] = [];
	let match: RegExpExecArray | null;

	while ((match = regex.exec(content)) !== null) {
		tables.push(match[1]);
	}

	return tables;
}

async function enableRls() {
	const testingFlag = process.argv.includes("--testing");
	if (testingFlag) {
		setDbMode("testing");
	}

	const mode = getDbMode();
	const dbUrl =
		mode === "testing" ? env.SUPABASE_DB_TESTING_URL : env.SUPABASE_DB_URL;
	const source = testingFlag ? "--testing flag" : `NODE_ENV=${env.NODE_ENV}`;
	console.log("[DB Target]");
	console.log(`  Mode: ${mode}  (from ${source})`);
	console.log(`  URL:  ${maskDbUrl(dbUrl)}`);
	console.log();

	const tables = parseTableNames();

	if (tables.length === 0) {
		console.error("No tables found in schema.ts");
		process.exit(1);
	}

	console.log(`Found ${tables.length} tables in schema.ts\n`);

	for (const table of tables) {
		try {
			await db.execute(
				sql.raw(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`),
			);
			console.log(`  ✓ ${table}`);
		} catch (error) {
			console.error(
				`  ✗ ${table}: ${error instanceof Error ? error.message : error}`,
			);
		}
	}

	console.log("\nRLS enabled on all tables.");
	process.exit(0);
}

enableRls();
