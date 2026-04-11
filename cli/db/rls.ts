import { readFileSync } from "node:fs";
import { join } from "node:path";
import { sql } from "drizzle-orm";
import { db } from "../../src/lib/db";

const SCHEMA_PATH = join(import.meta.dir, "../../src/database/schema.ts");

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
