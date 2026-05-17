import { createInterface } from "node:readline";
import { fakerID_ID as faker } from "@faker-js/faker";
import { generateRandomString, hashPassword } from "better-auth/crypto";
import { eq, inArray, like } from "drizzle-orm";
import {
	accounts,
	options,
	pretestSubmissions,
	questions,
	quizzes,
	schools,
	submissions,
	users,
} from "../../src/database/schema";
import { db, getDbMode, setDbMode } from "../../src/lib/db";
import { env } from "../../src/lib/env";

// ============================================================================
// FLAGS
// ============================================================================

const argv = process.argv.slice(2);

function intFlag(name: string, fallback: number): number {
	const idx = argv.indexOf(name);
	if (idx === -1) return fallback;
	const val = Number(argv[idx + 1]);
	return Number.isFinite(val) && val > 0 ? Math.floor(val) : fallback;
}

const flags = {
	count: intFlag("--count", 50),
	clear: argv.includes("--clear"),
	testing: argv.includes("--testing"),
	yes: argv.includes("--yes") || argv.includes("-y"),
};

// ============================================================================
// HELPERS
// ============================================================================

function maskDbUrl(url: string): string {
	return url.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:****@");
}

async function confirm(message: string): Promise<boolean> {
	if (flags.yes) return true;
	const rl = createInterface({ input: process.stdin, output: process.stdout });
	return new Promise((resolve) => {
		rl.question(`${message} (y/N): `, (answer) => {
			rl.close();
			resolve(answer.trim().toLowerCase() === "y");
		});
	});
}

const BATCH_SIZE = 1000;

// ============================================================================
// MAIN
// ============================================================================

async function main() {
	console.log("=".repeat(60));
	console.log("  TelNetQuiz — Seed Mock Users + Submissions");
	console.log("=".repeat(60));
	console.log();

	if (flags.testing) setDbMode("testing");
	const mode = getDbMode();
	const dbUrl =
		mode === "testing" ? env.SUPABASE_DB_TESTING_URL : env.SUPABASE_DB_URL;
	const source = flags.testing ? "--testing flag" : `NODE_ENV=${env.NODE_ENV}`;
	console.log("[DB Target]");
	console.log(`  Mode:   ${mode}  (from ${source})`);
	console.log(`  URL:    ${maskDbUrl(dbUrl)}`);
	console.log(`  Count:  ${flags.count} users`);
	console.log(`  Clear:  ${flags.clear}`);
	console.log();

	// Phase 1: load existing reference data
	console.log("[Phase 1] Reading chapters / quizzes / schools / pretest...");
	const schoolRows = await db.select({ id: schools.id }).from(schools);
	const quizRows = (
		await db
			.select({
				id: quizzes.id,
				chapterId: quizzes.chapterId,
				level: quizzes.level,
			})
			.from(quizzes)
	).filter(
		(q): q is { id: number; chapterId: number; level: number } =>
			q.chapterId !== null,
	);

	const pretestQuestions = await db
		.select({ id: questions.id })
		.from(questions)
		.where(eq(questions.type, "pretest"));

	const pretestOptions = pretestQuestions.length
		? await db
				.select({
					id: options.id,
					questionId: options.questionId,
					isCorrect: options.isCorrect,
				})
				.from(options)
				.where(
					inArray(
						options.questionId,
						pretestQuestions.map((q) => q.id),
					),
				)
		: [];

	if (quizRows.length === 0) {
		console.error(
			"ERROR: No quizzes found. Run `bun cli/content/seed.ts` first.",
		);
		process.exit(1);
	}

	const pretestPerQuestion = pretestQuestions
		.map((q) => {
			const opts = pretestOptions.filter((o) => o.questionId === q.id);
			const correct = opts.find((o) => o.isCorrect);
			return {
				questionId: q.id,
				correctOptionId: correct?.id ?? null,
				wrongOptionIds: opts.filter((o) => !o.isCorrect).map((o) => o.id),
			};
		})
		.filter((pq) => pq.correctOptionId !== null);

	console.log(`  ${schoolRows.length} schools`);
	console.log(`  ${quizRows.length} quizzes`);
	console.log(`  ${pretestPerQuestion.length} pretest questions usable`);
	console.log();

	// Phase 2: optionally clear prior mock users
	if (flags.clear) {
		console.log("[Phase 2] Clearing prior mock users (email LIKE '%@mock.test')...");
		const ok = await confirm(
			"Delete every user with @mock.test email (cascades to their submissions)?",
		);
		if (!ok) {
			console.log("Aborted.");
			process.exit(0);
		}
		const deleted = await db
			.delete(users)
			.where(like(users.email, "%@mock.test"))
			.returning({ id: users.id });
		console.log(`  Deleted ${deleted.length} prior mock users.\n`);
	}

	// Phase 3: generate users + credential accounts
	console.log(`[Phase 3] Generating ${flags.count} Indonesian mock users...`);
	const passwordHash = await hashPassword("password123");
	const stamp = Date.now().toString(36);

	const newUsers: (typeof users.$inferInsert)[] = [];
	const newAccounts: (typeof accounts.$inferInsert)[] = [];

	for (let i = 0; i < flags.count; i++) {
		const id = generateRandomString(32, "a-z", "0-9");
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		newUsers.push({
			id,
			name: `${firstName} ${lastName}`,
			email: `mock-${stamp}-${i}@mock.test`,
			emailVerified: true,
			role: "user",
			schoolId:
				schoolRows.length > 0
					? faker.helpers.arrayElement(schoolRows.map((s) => s.id))
					: null,
			gender: faker.datatype.boolean(),
			grade: faker.helpers.arrayElement(["X", "XI", "XII"]),
			bio: faker.lorem.sentence(),
			hasTakenPretest: false,
			banned: false,
		});
		newAccounts.push({
			id: generateRandomString(32, "a-z", "0-9"),
			accountId: id,
			providerId: "credential",
			userId: id,
			password: passwordHash,
		});
	}

	for (let i = 0; i < newUsers.length; i += BATCH_SIZE) {
		await db.insert(users).values(newUsers.slice(i, i + BATCH_SIZE));
	}
	for (let i = 0; i < newAccounts.length; i += BATCH_SIZE) {
		await db.insert(accounts).values(newAccounts.slice(i, i + BATCH_SIZE));
	}
	console.log(`  Inserted ${newUsers.length} users + accounts.\n`);

	const userIds = newUsers.map((u) => u.id);
	const now = new Date();

	// Phase 4: pretest submissions for ~80% of new users
	if (pretestPerQuestion.length > 0) {
		console.log("[Phase 4] Generating pretest submissions...");
		const takerCount = Math.max(1, Math.floor(userIds.length * 0.8));
		const takers = faker.helpers.arrayElements(userIds, takerCount);
		const rows: (typeof pretestSubmissions.$inferInsert)[] = [];

		for (const userId of takers) {
			const dayOffset = faker.number.int({ min: 1, max: 14 });
			const date = new Date(
				Date.UTC(
					now.getUTCFullYear(),
					now.getUTCMonth(),
					now.getUTCDate() - dayOffset,
					faker.number.int({ min: 8, max: 16 }),
					faker.number.int({ min: 0, max: 59 }),
				),
			);
			for (const pq of pretestPerQuestion) {
				const wantCorrect = faker.number.float({ max: 1 }) > 0.4;
				const answeredOptionId =
					wantCorrect || pq.wrongOptionIds.length === 0
						? pq.correctOptionId
						: faker.helpers.arrayElement(pq.wrongOptionIds);
				if (answeredOptionId == null) continue;
				rows.push({
					userId,
					questionId: pq.questionId,
					answeredOptionId,
					isCorrect: answeredOptionId === pq.correctOptionId,
					createdAt: date,
				});
			}
		}

		for (let i = 0; i < rows.length; i += BATCH_SIZE) {
			await db
				.insert(pretestSubmissions)
				.values(rows.slice(i, i + BATCH_SIZE));
		}
		if (takers.length > 0) {
			await db
				.update(users)
				.set({ hasTakenPretest: true })
				.where(inArray(users.id, takers));
		}
		console.log(
			`  Inserted ${rows.length} pretest submissions across ${takers.length} users.\n`,
		);
	} else {
		console.log("[Phase 4] No pretest questions found — skipping.\n");
	}

	// Phase 5: quiz submissions across 14 days
	console.log("[Phase 5] Generating quiz submissions...");
	const quizSubs: (typeof submissions.$inferInsert)[] = [];
	const ACTIVE_DAYS = 14;

	for (const userId of userIds) {
		const userType = faker.helpers.weightedArrayElement([
			{ value: "power" as const, weight: 20 },
			{ value: "regular" as const, weight: 50 },
			{ value: "casual" as const, weight: 30 },
		]);
		const maxLevel =
			userType === "power" ? 20 : userType === "regular" ? 10 : 3;
		const skipChance =
			userType === "power" ? 0.05 : userType === "regular" ? 0.3 : 0.5;

		for (let day = 0; day < ACTIVE_DAYS; day++) {
			const sessionsPerDay =
				userType === "power"
					? faker.number.int({ min: 3, max: 6 })
					: userType === "regular"
						? faker.number.int({ min: 1, max: 3 })
						: faker.number.int({ min: 0, max: 2 });
			if (sessionsPerDay === 0) continue;

			const eligible = quizRows.filter((q) => q.level <= maxLevel);
			if (eligible.length === 0) continue;
			const todayQuizzes = faker.helpers.arrayElements(
				eligible,
				Math.min(sessionsPerDay, eligible.length),
			);

			for (const quiz of todayQuizzes) {
				if (faker.number.float({ max: 1 }) < skipChance) continue;
				const baseMin = quiz.level <= 7 ? 50 : quiz.level <= 14 ? 30 : 20;
				const baseMax = quiz.level <= 7 ? 100 : quiz.level <= 14 ? 90 : 80;
				const dayBonus = Math.floor((day / ACTIVE_DAYS) * 15);
				const score = faker.number.int({
					min: Math.min(baseMin + dayBonus, baseMax),
					max: baseMax,
				});
				const date = new Date(
					Date.UTC(
						now.getUTCFullYear(),
						now.getUTCMonth(),
						now.getUTCDate() - (ACTIVE_DAYS - 1 - day),
						faker.number.int({ min: 7, max: 21 }),
						faker.number.int({ min: 0, max: 59 }),
					),
				);
				quizSubs.push({
					userId,
					chapterId: quiz.chapterId,
					quizId: quiz.id,
					score,
					createdAt: date,
				});
			}
		}
	}

	for (let i = 0; i < quizSubs.length; i += BATCH_SIZE) {
		await db.insert(submissions).values(quizSubs.slice(i, i + BATCH_SIZE));
	}
	console.log(`  Inserted ${quizSubs.length} quiz submissions.\n`);

	console.log("=".repeat(60));
	console.log("  DONE");
	console.log("=".repeat(60));
	process.exit(0);
}

main().catch((err) => {
	console.error("ERROR:", err);
	process.exit(1);
});
