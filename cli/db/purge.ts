import { createInterface } from "node:readline";
import { db } from "../../src/lib/db";
import {
	schools,
	users,
	sessions,
	accounts,
	verifications,
	chapters,
	quizzes,
	questions,
	options,
	submissions,
	pretestSubmissions,
	studyMaterials,
	achievements,
	userAchievements,
} from "../../src/database/schema";
import { sql, count, eq, inArray, ne } from "drizzle-orm";

// ============================================================================
// CLI HELPERS
// ============================================================================

const flags = {
	force: process.argv.includes("--force"),
	dryRun: process.argv.includes("--dry-run"),
};

async function confirm(message: string): Promise<boolean> {
	if (flags.force) return true;
	const rl = createInterface({ input: process.stdin, output: process.stdout });
	return new Promise((resolve) => {
		rl.question(`${message} (y/N): `, (answer) => {
			rl.close();
			resolve(answer.toLowerCase() === "y");
		});
	});
}

// ============================================================================
// TABLE DEFINITIONS (ordered for safe deletion — leaf tables first)
// ============================================================================

const CONTENT_TABLES = [
	{ name: "pretest_submissions", table: pretestSubmissions, hasSerial: true },
	{ name: "submissions", table: submissions, hasSerial: true },
	{ name: "user_achievements", table: userAchievements, hasSerial: true },
	{ name: "options", table: options, hasSerial: true },
	{ name: "questions", table: questions, hasSerial: true },
	{ name: "quizzes", table: quizzes, hasSerial: true },
	{ name: "chapters", table: chapters, hasSerial: true },
	{ name: "study_materials", table: studyMaterials, hasSerial: true },
	{ name: "achievements", table: achievements, hasSerial: true },
	{ name: "verifications", table: verifications, hasSerial: false },
	{ name: "schools", table: schools, hasSerial: true },
] as const;

// ============================================================================
// MAIN
// ============================================================================

async function main() {
	console.log("=".repeat(60));
	console.log("  TelNetQuiz — Database Purge (Nuclear)");
	console.log("=".repeat(60));
	console.log();

	console.log("[Flags]");
	console.log(`  --force:   ${flags.force}`);
	console.log(`  --dry-run: ${flags.dryRun}`);
	console.log();

	// Phase 1: Identify Google OAuth users to preserve
	console.log("[Phase 1] Identifying protected accounts...");

	const googleAccounts = await db
		.select({ userId: accounts.userId })
		.from(accounts)
		.where(eq(accounts.providerId, "google"));

	const protectedUserIds = new Set(googleAccounts.map((a) => a.userId));

	if (protectedUserIds.size > 0) {
		console.log(`  ${protectedUserIds.size} Google OAuth user(s) will be PRESERVED`);
	} else {
		console.log("  No Google OAuth accounts found");
	}
	console.log();

	// Phase 2: Count rows in each table
	console.log("[Phase 2] Counting rows...");

	const counts: { name: string; rows: number }[] = [];

	for (const { name, table } of CONTENT_TABLES) {
		const [result] = await db.select({ value: count() }).from(table);
		counts.push({ name, rows: result.value });
	}

	// Count non-Google auth rows separately
	const [sessionCount] = await db.select({ value: count() }).from(sessions);
	const [accountCount] = await db.select({ value: count() }).from(accounts);
	const [userCount] = await db.select({ value: count() }).from(users);

	const protectedIds = [...protectedUserIds];
	const nonGoogleSessionCount = protectedIds.length > 0
		? sessionCount.value - (await db.select({ value: count() }).from(sessions).where(inArray(sessions.userId, protectedIds)))[0].value
		: sessionCount.value;
	const nonGoogleAccountCount = protectedIds.length > 0
		? accountCount.value - (await db.select({ value: count() }).from(accounts).where(inArray(accounts.userId, protectedIds)))[0].value
		: accountCount.value;
	const nonGoogleUserCount = protectedIds.length > 0
		? userCount.value - protectedIds.length
		: userCount.value;

	counts.push({ name: "sessions (non-Google)", rows: nonGoogleSessionCount });
	counts.push({ name: "accounts (non-Google)", rows: nonGoogleAccountCount });
	counts.push({ name: "users (non-Google)", rows: nonGoogleUserCount });

	const totalRows = counts.reduce((sum, c) => sum + c.rows, 0);

	console.log();
	console.log("  Table                         Rows");
	console.log("  " + "-".repeat(44));

	for (const { name, rows } of counts) {
		const label = name.padEnd(30);
		const rowStr = rows > 0 ? `${rows}` : "-";
		console.log(`  ${label}${rowStr}`);
	}

	if (protectedUserIds.size > 0) {
		console.log();
		console.log(`  (preserved)                   ${protectedUserIds.size} Google user(s) + their accounts/sessions`);
	}

	console.log("  " + "-".repeat(44));
	console.log(`  ${"TOTAL TO DELETE".padEnd(30)}${totalRows}`);
	console.log();

	if (totalRows === 0) {
		console.log("Nothing to purge (only Google OAuth data remains).");
		process.exit(0);
	}

	// Phase 3: Dry run exit
	if (flags.dryRun) {
		console.log("[Dry Run] Would delete all rows listed above. No changes made.");
		console.log("  Google OAuth users and their auth data are preserved.");
		process.exit(0);
	}

	// Phase 4: Confirmation
	console.log("[Phase 3] Confirmation");
	console.log("  WARNING: This will PERMANENTLY DELETE:");
	console.log("    - All content (chapters, quizzes, questions, options, materials)");
	console.log("    - All submissions (quiz + pretest)");
	console.log("    - All non-Google users, accounts, sessions");
	console.log("    - All schools, achievements");
	console.log();
	console.log("  PRESERVED: Google OAuth users + their accounts & sessions");
	console.log();

	const proceed = await confirm("  Are you absolutely sure?");
	if (!proceed) {
		console.log("Aborted.");
		process.exit(0);
	}

	console.log();

	// Phase 5: Delete data in transaction
	console.log("[Phase 4] Purging data...");

	await db.transaction(async (tx) => {
		// Delete users first (they reference schools via school_id FK)
		if (protectedIds.length > 0) {
			const delSessions = await tx
				.delete(sessions)
				.where(sql`${sessions.userId} NOT IN (${sql.join(protectedIds.map((id) => sql`${id}`), sql`, `)})`)
				.returning({ id: sessions.id });
			console.log(`  sessions: ${delSessions.length} deleted (${sessionCount.value - delSessions.length} Google preserved)`);

			const delAccounts = await tx
				.delete(accounts)
				.where(sql`${accounts.userId} NOT IN (${sql.join(protectedIds.map((id) => sql`${id}`), sql`, `)})`)
				.returning({ id: accounts.id });
			console.log(`  accounts: ${delAccounts.length} deleted (${accountCount.value - delAccounts.length} Google preserved)`);

			const delUsers = await tx
				.delete(users)
				.where(sql`${users.id} NOT IN (${sql.join(protectedIds.map((id) => sql`${id}`), sql`, `)})`)
				.returning({ id: users.id });
			console.log(`  users: ${delUsers.length} deleted (${protectedIds.length} Google preserved)`);

			// Reset preserved users: clear school reference + pretest status
			await tx
				.update(users)
				.set({ hasTakenPretest: false, schoolId: null })
				.where(inArray(users.id, protectedIds));
			console.log(`  Reset hasTakenPretest & schoolId for ${protectedIds.length} preserved user(s)`);
		} else {
			await tx.delete(sessions);
			console.log(`  sessions: ${sessionCount.value} deleted`);
			await tx.delete(accounts);
			console.log(`  accounts: ${accountCount.value} deleted`);
			await tx.delete(users);
			console.log(`  users: ${userCount.value} deleted`);
		}

		// Delete content tables (safe now — no user FK references to schools)
		for (const { name, table } of CONTENT_TABLES) {
			const rowCount = counts.find((c) => c.name === name)?.rows ?? 0;
			if (rowCount === 0) {
				console.log(`  ${name}: skipped (empty)`);
				continue;
			}
			await tx.delete(table);
			console.log(`  ${name}: ${rowCount} rows deleted`);
		}
	});

	console.log();

	// Phase 6: Reset sequences
	console.log("[Phase 5] Resetting sequences...");

	const sequenceTables = CONTENT_TABLES.filter((t) => t.hasSerial);
	for (const { name } of sequenceTables) {
		await db.execute(sql.raw(`ALTER SEQUENCE ${name}_id_seq RESTART WITH 1`));
		console.log(`  ${name}_id_seq → 1`);
	}

	console.log();

	// Phase 7: Summary
	console.log("=".repeat(60));
	console.log("     PURGE COMPLETE");
	console.log("=".repeat(60));
	console.log(`  ${totalRows} total rows deleted`);
	console.log(`  ${sequenceTables.length} sequences reset`);
	if (protectedUserIds.size > 0) {
		console.log(`  ${protectedUserIds.size} Google OAuth user(s) preserved`);
	}
	console.log("=".repeat(60));
	console.log();
	console.log("Database berhasil di-purge!");

	process.exit(0);
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
