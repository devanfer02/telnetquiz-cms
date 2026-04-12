import { readFileSync } from "node:fs";
import { join } from "node:path";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { achievements } from "../../src/database/schema";

const DATABASE_URL = process.env.SUPABASE_DB_URL;
if (!DATABASE_URL) {
	console.error("SUPABASE_DB_URL not set");
	process.exit(1);
}

interface AchievementJson {
	slug: string;
	title: string;
	description: string;
	icon: string;
	rule: Record<string, unknown>;
}

const ACHIEVEMENTS_FILE = join(import.meta.dir, "data", "prod", "achievements.json");

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

async function main() {
	console.log("=".repeat(60));
	console.log("  TelNetQuiz — Seed Achievements (prod)");
	console.log("=".repeat(60));
	console.log();

	let data: AchievementJson[];
	try {
		const raw = readFileSync(ACHIEVEMENTS_FILE, "utf-8");
		data = JSON.parse(raw) as AchievementJson[];
	} catch (err) {
		console.error(`ERROR: Failed to read ${ACHIEVEMENTS_FILE}`);
		console.error(err instanceof Error ? err.message : err);
		process.exit(1);
	}

	console.log(`[Phase 1] Loaded ${data.length} achievements from JSON`);
	for (const a of data) {
		console.log(`  - ${a.slug}: ${a.title}`);
	}
	console.log();

	console.log("[Phase 2] Upserting achievements...");
	await db
		.insert(achievements)
		.values(data)
		.onConflictDoUpdate({
			target: achievements.slug,
			set: {
				title: sql`excluded.title`,
				description: sql`excluded.description`,
				icon: sql`excluded.icon`,
				rule: sql`excluded.rule`,
			},
		});

	console.log(`  Upserted ${data.length} achievements`);
	console.log();

	const rows = await db.select().from(achievements);
	console.log("=".repeat(60));
	console.log("  ACHIEVEMENTS IN DB");
	console.log("=".repeat(60));
	for (const r of rows) {
		console.log(`  [${r.id}] ${r.slug} — ${r.title} (active: ${r.isActive})`);
	}
	console.log("=".repeat(60));

	await pool.end();
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
