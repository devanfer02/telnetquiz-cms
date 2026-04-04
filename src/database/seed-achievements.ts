import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { achievements } from "./schema";

const DATABASE_URL = process.env.SUPABASE_DB_URL;
if (!DATABASE_URL) {
	console.error("SUPABASE_DB_URL not set");
	process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

const seedAchievements = [
	{
		slug: "pretest_complete",
		title: "Penjelajah Pretest",
		description: "Menyelesaikan pretest",
		icon: "scroll-text",
		rule: { ">": [{ var: "pretest_total" }, 0] },
	},
	{
		slug: "first_quiz",
		title: "Kuis Pertama",
		description: "Menyelesaikan kuis pertama",
		icon: "trophy",
		rule: { ">": [{ var: "total_submissions" }, 0] },
	},
	{
		slug: "perfect_score",
		title: "Nilai Sempurna",
		description: "Mendapatkan nilai 100 pada kuis",
		icon: "star",
		rule: { "==": [{ var: "has_perfect_score" }, true] },
	},
	{
		slug: "chapter_master",
		title: "Penguasa Bab",
		description: "Menyelesaikan semua kuis dalam satu bab",
		icon: "crown",
		rule: { ">": [{ var: "chapters_completed" }, 0] },
	},
];

async function seed() {
	console.log("Seeding achievements...");

	await db
		.insert(achievements)
		.values(seedAchievements)
		.onConflictDoUpdate({
			target: achievements.slug,
			set: {
				title: sql`excluded.title`,
				description: sql`excluded.description`,
				icon: sql`excluded.icon`,
				rule: sql`excluded.rule`,
			},
		});

	console.log(`Seeded ${seedAchievements.length} achievements`);
	await pool.end();
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
