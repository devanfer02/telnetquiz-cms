import { faker } from "@faker-js/faker";
import {
	hashPassword,
	generateRandomString,
} from "better-auth/crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { asc, eq, inArray, like } from "drizzle-orm";
import { db } from "../src/lib/db";
import {
	chapters,
	quizzes,
	questions,
	options,
	studyMaterials,
	schools,
	users,
	accounts,
	submissions,
	pretestSubmissions,
} from "../src/database/schema";

// ============================================================================
// LOAD MOCK DATA FROM JSON
// ============================================================================

const MOCK_DIR = join(import.meta.dir, "contents", "mock");

function loadJson<T>(filename: string): T {
	return JSON.parse(readFileSync(join(MOCK_DIR, filename), "utf-8")) as T;
}

interface QuestionTemplate {
	description: string;
	question: string;
	correct: string;
	wrong: string[];
}

const studyMaterialsData = loadJson<
	{ title: string; imageLink: string; content: string }[]
>("study-materials.json");

const chaptersData = loadJson<
	{ title: string; description: string; mascotId: number }[]
>("chapters.json");

const pretestData = loadJson<
	{
		chapterIndex: number;
		materialIndex: number;
		imageLink: string | null;
		description: string;
		question: string;
		options: { text: string; isCorrect: boolean }[];
	}[]
>("pretest.json");

const quizzesData = loadJson<
	{
		chapterIndex: number;
		title: string;
		level: number;
		difficulty: "easy" | "medium" | "hard";
		materialIndices: number[];
		questions: {
			description: string;
			question: string;
			imageLink: string | null;
			options: { text: string; isCorrect: boolean }[];
		}[];
	}[]
>("quizzes.json");

const telcoChaptersData = loadJson<
	{ title: string; description: string; mascotId: number }[]
>("telco-chapters.json");

const telcoStudyMaterialsData = loadJson<
	{ title: string; imageLink: string | null; content: string }[]
>("telco-study-materials.json");

const telcoPretestData = loadJson<
	{
		chapterOffset: number;
		materialOffset: number;
		imageLink: string | null;
		description: string;
		question: string;
		options: { text: string; isCorrect: boolean }[];
	}[]
>("telco-pretest.json");

const telcoQuestionTemplates = loadJson<QuestionTemplate[][]>(
	"telco-questions.json",
);

const schoolNames = loadJson<string[]>("schools.json");


// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDifficultyForLevel(level: number): "easy" | "medium" | "hard" {
	if (level <= 7) return "easy";
	if (level <= 14) return "medium";
	return "hard";
}

function generateQuestionsForQuiz(
	chapterTemplateIndex: number,
	quizId: number,
	chapterId: number,
	materialIds: number[],
): {
	chapterId: number;
	quizId: number;
	materialId: number;
	description: string;
	question: string;
	options: { text: string; isCorrect: boolean }[];
}[] {
	const templates = telcoQuestionTemplates[chapterTemplateIndex];
	const picked = faker.helpers.arrayElements(templates, 10);

	return picked.map((t) => {
		const shuffledOptions = faker.helpers.shuffle([
			{ text: t.correct, isCorrect: true },
			{ text: t.wrong[0], isCorrect: false },
			{ text: t.wrong[1], isCorrect: false },
			{ text: t.wrong[2], isCorrect: false },
		]);

		return {
			chapterId,
			quizId,
			materialId: faker.helpers.arrayElement(materialIds),
			description: t.description,
			question: t.question,
			options: shuffledOptions,
		};
	});
}


async function generateMockUsers(schoolIds: number[]) {
	const passwordHash = await hashPassword("password123");

	return Array.from({ length: 100 }, (_, i) => {
		const id = generateRandomString(32, "a-z", "0-9");
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();

		return {
			user: {
				id,
				name: `${firstName} ${lastName}`,
				email: `user${i}@mock.test`,
				emailVerified: true,
				image: null,
				role: "user",
				schoolId: faker.helpers.arrayElement(schoolIds),
				gender: faker.datatype.boolean(),
				grade: faker.helpers.arrayElement(["X", "XI", "XII"]),
				bio: faker.lorem.sentence(),
				hasTakenPretest: false,
				banned: false,
			},
			account: {
				id: generateRandomString(32, "a-z", "0-9"),
				accountId: id,
				providerId: "credential",
				userId: id,
				password: passwordHash,
			},
		};
	});
}

function generateQuizSubmissions(
	userIds: string[],
	allQuizData: { quizId: number; chapterId: number; level: number }[],
) {
	const byChapter = new Map<
		number,
		{ quizId: number; chapterId: number; level: number }[]
	>();
	for (const q of allQuizData) {
		const arr = byChapter.get(q.chapterId) ?? [];
		arr.push(q);
		byChapter.set(q.chapterId, arr);
	}

	const subs: {
		userId: string;
		chapterId: number;
		quizId: number;
		score: number;
		createdAt: Date;
	}[] = [];

	const now = new Date();

	const allQuizIds = allQuizData.map((q) => q.quizId);

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

		// Every user has exactly 14 days of activity
		const ACTIVE_DAYS = 14;

		// Generate submissions day by day for 14 days
		for (let day = 0; day < ACTIVE_DAYS; day++) {
			// How many quiz attempts per day varies by user type
			const sessionsPerDay =
				userType === "power" ? faker.number.int({ min: 3, max: 6 })
				: userType === "regular" ? faker.number.int({ min: 1, max: 3 })
				: faker.number.int({ min: 0, max: 2 });

			if (sessionsPerDay === 0) continue;

			// Pick random quizzes to attempt today
			const todayQuizzes = faker.helpers.arrayElements(
				allQuizData.filter((q) => q.level <= maxLevel),
				Math.min(sessionsPerDay, allQuizData.length),
			);

			for (const quiz of todayQuizzes) {
				if (faker.number.float({ max: 1 }) < skipChance) continue;

				const baseMin = quiz.level <= 7 ? 50 : quiz.level <= 14 ? 30 : 20;
				const baseMax = quiz.level <= 7 ? 100 : quiz.level <= 14 ? 90 : 80;

				// Later days tend to have higher scores (learning progression)
				const dayBonus = Math.floor((day / ACTIVE_DAYS) * 15);
				const score = Math.round(
					faker.number.int({
						min: Math.min(baseMin + dayBonus, baseMax),
						max: baseMax,
					}),
				);

				const date = new Date(
					Date.UTC(
						now.getUTCFullYear(),
						now.getUTCMonth(),
						now.getUTCDate() - (ACTIVE_DAYS - 1 - day),
						faker.number.int({ min: 7, max: 21 }),
						faker.number.int({ min: 0, max: 59 }),
						faker.number.int({ min: 0, max: 59 }),
					),
				);

				subs.push({
					userId,
					chapterId: quiz.chapterId,
					quizId: quiz.quizId,
					score,
					createdAt: date,
				});
			}
		}
	}

	return subs;
}

function generatePretestSubmissions(
	userIds: string[],
	pretestQuestionsWithOptions: {
		questionId: number;
		correctOptionId: number;
		wrongOptionIds: number[];
	}[],
) {
	const takenUserIds = faker.helpers.arrayElements(
		userIds,
		Math.min(80, userIds.length),
	);
	const subs: {
		userId: string;
		questionId: number;
		answeredOptionId: number;
		isCorrect: boolean;
		createdAt: Date;
	}[] = [];

	const now = new Date();

	for (const userId of takenUserIds) {
		// Each user took pretest on a specific day (1-14 days ago)
		const dayOffset = faker.number.int({ min: 1, max: 14 });
		const pretestDate = new Date(
			Date.UTC(
				now.getUTCFullYear(),
				now.getUTCMonth(),
				now.getUTCDate() - dayOffset,
				faker.number.int({ min: 8, max: 16 }),
				faker.number.int({ min: 0, max: 59 }),
			),
		);

		for (let i = 0; i < pretestQuestionsWithOptions.length; i++) {
			const pq = pretestQuestionsWithOptions[i];
			const answersCorrectly = faker.number.float({ max: 1 }) < 0.7;
			const answeredOptionId = answersCorrectly
				? pq.correctOptionId
				: faker.helpers.arrayElement(pq.wrongOptionIds);

			subs.push({
				userId,
				questionId: pq.questionId,
				answeredOptionId,
				isCorrect: answersCorrectly,
				createdAt: new Date(pretestDate.getTime() + i * 30_000),
			});
		}
	}

	return { submissions: subs, userIdsWhoTookPretest: takenUserIds };
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

const scaleMode = process.argv.includes("--scale");

async function seed() {
	faker.seed(42);

	if (scaleMode) {
		console.log("MODE: --scale (essentials + telco chapters + 100 users + submissions)\n");
	} else {
		console.log("MODE: essentials only (2 chapters, 12 quizzes, ~89 questions)\n");
		console.log("  Tip: run with --scale for full scale-test data\n");
	}

	try {
		// ================================================================
		// PHASE 1: CONTENT DATA (essentials)
		// ================================================================

		const allChapterTitles = scaleMode
			? [...chaptersData, ...telcoChaptersData].map((c) => c.title)
			: chaptersData.map((c) => c.title);

		const existingChapters = await db
			.select()
			.from(chapters)
			.where(inArray(chapters.title, allChapterTitles))
			.orderBy(asc(chapters.id));

		const contentAlreadySeeded = existingChapters.length === allChapterTitles.length;

		// 1. Study Materials
		let insertedMaterials: (typeof studyMaterials.$inferSelect)[];
		if (contentAlreadySeeded) {
			console.log("[Phase 1] Materi pembelajaran sudah ada, skip insert...");
			insertedMaterials = await db
				.select()
				.from(studyMaterials)
				.orderBy(asc(studyMaterials.id));
		} else {
			console.log("[Phase 1] Memasukkan data materi pembelajaran...");
			const materialsToInsert = scaleMode
				? [...studyMaterialsData, ...telcoStudyMaterialsData]
				: studyMaterialsData;
			insertedMaterials = await db
				.insert(studyMaterials)
				.values(materialsToInsert)
				.returning();
			console.log(`  ${insertedMaterials.length} materi pembelajaran berhasil dimasukkan`);
		}

		// 2. Chapters
		let insertedChapters: (typeof chapters.$inferSelect)[];
		if (contentAlreadySeeded) {
			console.log("[Phase 1] Bab sudah ada, skip insert...");
			insertedChapters = existingChapters;
		} else {
			console.log("[Phase 1] Memasukkan data bab...");
			const chaptersToInsert = scaleMode
				? [...chaptersData, ...telcoChaptersData]
				: chaptersData;
			insertedChapters = await db
				.insert(chapters)
				.values(chaptersToInsert)
				.returning();
			console.log(`  ${insertedChapters.length} bab berhasil dimasukkan`);
		}

		// 3–5. Pretest questions, quizzes, and quiz questions
		const pretestQuestionsWithOptions: {
			questionId: number;
			correctOptionId: number;
			wrongOptionIds: number[];
		}[] = [];
		let totalQuizzes = 0;
		let totalQuestions = 0;
		const allQuizData: {
			quizId: number;
			chapterId: number;
			level: number;
		}[] = [];

		if (contentAlreadySeeded) {
			console.log("[Phase 1] Pertanyaan & kuis sudah ada, skip insert...");

			const chapterIds = insertedChapters.map((c) => c.id);
			const existingPretestQs = await db
				.select({ id: questions.id, chapterId: questions.chapterId })
				.from(questions)
				.where(
					eq(questions.type, "pretest"),
				);
			for (const pq of existingPretestQs) {
				const opts = await db
					.select()
					.from(options)
					.where(eq(options.questionId, pq.id));
				const correct = opts.find((o) => o.isCorrect);
				if (correct) {
					pretestQuestionsWithOptions.push({
						questionId: pq.id,
						correctOptionId: correct.id,
						wrongOptionIds: opts.filter((o) => !o.isCorrect).map((o) => o.id),
					});
				}
			}

			const existingQuizzes = await db
				.select()
				.from(quizzes)
				.where(inArray(quizzes.chapterId, chapterIds))
				.orderBy(asc(quizzes.id));
			for (const q of existingQuizzes) {
				allQuizData.push({
					quizId: q.id,
					chapterId: q.chapterId!,
					level: q.level,
				});
			}
			totalQuizzes = existingQuizzes.length;

			console.log(`  ${pretestQuestionsWithOptions.length} pertanyaan pretes ditemukan`);
			console.log(`  ${totalQuizzes} kuis ditemukan`);
		} else {
			// 3. Insert Pretest Questions (existing 2)
			console.log("[Phase 1] Memasukkan data pertanyaan pretes...");
			for (const pretest of pretestData) {
				const chapter = insertedChapters[pretest.chapterIndex];
				const material = insertedMaterials[pretest.materialIndex];

				const [insertedQuestion] = await db
					.insert(questions)
					.values({
						type: "pretest",
						chapterId: chapter.id,
						quizId: null,
						materialId: material.id,
						imageLink: pretest.imageLink,
						description: pretest.description,
						question: pretest.question,
					})
					.returning();

				const insertedOpts = await db
					.insert(options)
					.values(
						pretest.options.map((opt) => ({
							questionId: insertedQuestion.id,
							text: opt.text,
							isCorrect: opt.isCorrect,
						})),
					)
					.returning();

				pretestQuestionsWithOptions.push({
					questionId: insertedQuestion.id,
					correctOptionId: insertedOpts.find((o) => o.isCorrect)!.id,
					wrongOptionIds: insertedOpts
						.filter((o) => !o.isCorrect)
						.map((o) => o.id),
				});
			}
			console.log(`  ${pretestData.length} pertanyaan pretes berhasil dimasukkan`);

			// 3b. Insert Telco Pretest Questions (scale only)
			if (scaleMode) {
				console.log("[Phase 1] Memasukkan data pertanyaan pretes (telco)...");
				for (const pretest of telcoPretestData) {
					const chapter = insertedChapters[pretest.chapterOffset];
					const material = insertedMaterials[pretest.materialOffset];

					const [insertedQuestion] = await db
						.insert(questions)
						.values({
							type: "pretest",
							chapterId: chapter.id,
							quizId: null,
							materialId: material.id,
							imageLink: pretest.imageLink,
							description: pretest.description,
							question: pretest.question,
						})
						.returning();

					const insertedOpts = await db
						.insert(options)
						.values(
							pretest.options.map((opt) => ({
								questionId: insertedQuestion.id,
								text: opt.text,
								isCorrect: opt.isCorrect,
							})),
						)
						.returning();

					pretestQuestionsWithOptions.push({
						questionId: insertedQuestion.id,
						correctOptionId: insertedOpts.find((o) => o.isCorrect)!.id,
						wrongOptionIds: insertedOpts
							.filter((o) => !o.isCorrect)
							.map((o) => o.id),
					});
				}
				console.log(
					`  ${telcoPretestData.length} pertanyaan pretes (telco) berhasil dimasukkan`,
				);
			}

			// 4. Insert Existing Quizzes and Questions (12 quizzes, ~89 questions)
			console.log("[Phase 1] Memasukkan data kuis existing...");

			for (const quizData of quizzesData) {
				const chapter = insertedChapters[quizData.chapterIndex];

				const [insertedQuiz] = await db
					.insert(quizzes)
					.values({
						chapterId: chapter.id,
						title: quizData.title,
						level: quizData.level,
						difficulty: quizData.difficulty,
					})
					.returning();

				allQuizData.push({
					quizId: insertedQuiz.id,
					chapterId: chapter.id,
					level: quizData.level,
				});
				totalQuizzes++;

				for (const questionData of quizData.questions) {
					const material = insertedMaterials[questionData.materialIndex];

					const [insertedQuestion] = await db
						.insert(questions)
						.values({
							type: "quiz",
							chapterId: chapter.id,
							quizId: insertedQuiz.id,
							materialId: material.id,
							imageLink: questionData.imageLink,
							description: questionData.description,
							question: questionData.question,
						})
						.returning();

					await db.insert(options).values(
						questionData.options.map((opt) => ({
							questionId: insertedQuestion.id,
							text: opt.text,
							isCorrect: opt.isCorrect,
						})),
					);

					totalQuestions++;
				}
			}
			console.log(`  ${totalQuizzes} kuis existing berhasil dimasukkan`);
			console.log(`  ${totalQuestions} pertanyaan existing berhasil dimasukkan`);

			// 5. Insert Telco Quizzes (scale only)
			if (scaleMode) {
				console.log(
					"[Phase 1] Memasukkan data kuis telco (5 bab x 20 level x 10 soal)...",
				);
				let telcoQuizCount = 0;
				let telcoQuestionCount = 0;

				for (let ci = 0; ci < telcoChaptersData.length; ci++) {
					const chapter = insertedChapters[ci + 2];
					const chapterMaterialIds = [
						insertedMaterials[13 + ci * 3].id,
						insertedMaterials[13 + ci * 3 + 1].id,
						insertedMaterials[13 + ci * 3 + 2].id,
					];

					const quizInsertData = Array.from({ length: 20 }, (_, li) => ({
						chapterId: chapter.id,
						title: `${telcoChaptersData[ci].title} - Level ${li + 1}`,
						level: li + 1,
						difficulty: getDifficultyForLevel(li + 1),
					}));
					const insertedQuizzes = await db
						.insert(quizzes)
						.values(quizInsertData)
						.returning();

					for (const quiz of insertedQuizzes) {
						allQuizData.push({
							quizId: quiz.id,
							chapterId: chapter.id,
							level: quiz.level,
						});
					}
					telcoQuizCount += insertedQuizzes.length;

					const allQuestionsData = insertedQuizzes.flatMap((quiz) =>
						generateQuestionsForQuiz(
							ci,
							quiz.id,
							chapter.id,
							chapterMaterialIds,
						),
					);

					const insertedQs = await db
						.insert(questions)
						.values(
							allQuestionsData.map((q) => ({
								type: "quiz" as const,
								chapterId: q.chapterId,
								quizId: q.quizId,
								materialId: q.materialId,
								imageLink: null,
								description: q.description,
								question: q.question,
							})),
						)
						.returning();

					const allOptionsData = insertedQs.flatMap((iq, idx) =>
						allQuestionsData[idx].options.map((opt) => ({
							questionId: iq.id,
							text: opt.text,
							isCorrect: opt.isCorrect,
						})),
					);
					await db.insert(options).values(allOptionsData);

					telcoQuestionCount += insertedQs.length;
					console.log(
						`  Bab "${telcoChaptersData[ci].title}": ${insertedQuizzes.length} kuis, ${insertedQs.length} soal`,
					);
				}

				totalQuizzes += telcoQuizCount;
				totalQuestions += telcoQuestionCount;
			}
		}

		// ================================================================
		// PHASE 2 & 3: USERS + SUBMISSIONS (scale only)
		// ================================================================

		let schoolCount = 0;
		let userCount = 0;
		let quizSubCount = 0;
		let pretestSubCount = 0;

		if (scaleMode) {
			// 6. Insert Schools
			console.log("\n[Phase 2] Memasukkan data sekolah...");
			const existingSchools = await db
				.select()
				.from(schools)
				.where(inArray(schools.name, schoolNames));

			let insertedSchools: (typeof schools.$inferSelect)[];
			if (existingSchools.length === schoolNames.length) {
				console.log("  Sekolah sudah ada, skip insert...");
				insertedSchools = existingSchools;
			} else {
				const existingNames = new Set(existingSchools.map((s) => s.name));
				const newSchools = schoolNames
					.filter((name) => !existingNames.has(name))
					.map((name) => ({ name }));
				const freshSchools = newSchools.length > 0
					? await db.insert(schools).values(newSchools).returning()
					: [];
				insertedSchools = [...existingSchools, ...freshSchools];
				console.log(`  ${freshSchools.length} sekolah baru dimasukkan, ${existingSchools.length} sudah ada`);
			}
			schoolCount = insertedSchools.length;

			// 7. Insert Users + Accounts
			const existingMockUsers = await db
				.select({ id: users.id })
				.from(users)
				.where(like(users.email, "user%@mock.test"));

			let userIds: string[];
			if (existingMockUsers.length > 0) {
				console.log(`[Phase 2] ${existingMockUsers.length} mock users sudah ada, skip insert...`);
				userIds = existingMockUsers.map((u) => u.id);
				userCount = existingMockUsers.length;
			} else {
				console.log("[Phase 2] Generating 100 mock users...");
				const schoolIds = insertedSchools.map((s) => s.id);
				const mockUsers = await generateMockUsers(schoolIds);

				const insertedUsers = await db
					.insert(users)
					.values(mockUsers.map((m) => m.user))
					.returning();
				userCount = insertedUsers.length;
				console.log(`  ${userCount} pengguna berhasil dimasukkan`);

				await db.insert(accounts).values(mockUsers.map((m) => m.account));
				console.log(`  ${mockUsers.length} akun berhasil dimasukkan`);
				userIds = insertedUsers.map((u) => u.id);
			}

			// 9. Quiz Submissions
			console.log("\n[Phase 3] Clearing existing mock user submissions...");
			await db.delete(submissions).where(inArray(submissions.userId, userIds));
			await db.delete(pretestSubmissions).where(inArray(pretestSubmissions.userId, userIds));

			console.log("[Phase 3] Generating quiz submissions...");
			const quizSubs = generateQuizSubmissions(userIds, allQuizData);
			for (let i = 0; i < quizSubs.length; i += 500) {
				await db
					.insert(submissions)
					.values(quizSubs.slice(i, i + 500));
			}
			quizSubCount = quizSubs.length;
			console.log(`  ${quizSubCount} quiz submissions berhasil dimasukkan`);

			// 10. Pretest Submissions
			console.log("[Phase 3] Generating pretest submissions...");
			const { submissions: pretestSubs, userIdsWhoTookPretest } =
				generatePretestSubmissions(
					userIds,
					pretestQuestionsWithOptions,
				);
			for (let i = 0; i < pretestSubs.length; i += 500) {
				await db
					.insert(pretestSubmissions)
					.values(pretestSubs.slice(i, i + 500));
			}
			pretestSubCount = pretestSubs.length;
			console.log(
				`  ${pretestSubCount} pretest submissions berhasil dimasukkan`,
			);

			// 11. Update hasTakenPretest
			if (userIdsWhoTookPretest.length > 0) {
				await db
					.update(users)
					.set({ hasTakenPretest: true })
					.where(inArray(users.id, userIdsWhoTookPretest));
				console.log(
					`  ${userIdsWhoTookPretest.length} pengguna ditandai sudah pretest`,
				);
			}

			// 12. Activity logs for devan@gmail.com
			console.log("\n[Phase 4] Generating activity logs for devan@gmail.com...");

			const existingDevan = await db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.email, "devan@gmail.com"))
				.limit(1);

			let devanId: string;

			if (existingDevan.length > 0) {
				devanId = existingDevan[0].id;
				console.log(`  User devan@gmail.com already exists (id: ${devanId}), skipping creation`);
				await db
					.delete(submissions)
					.where(eq(submissions.userId, devanId));
				console.log("  Cleared existing submissions for devan@gmail.com");
			} else {
				devanId = generateRandomString(32, "a-z", "0-9");
				const devanPasswordHash = await hashPassword("password123");

				await db.insert(users).values({
					id: devanId,
					name: "Devan",
					email: "devan@gmail.com",
					emailVerified: true,
					image: null,
					role: "user",
					schoolId: insertedSchools[0].id,
					gender: true,
					grade: "XI",
					bio: "Test user for activity logs",
					hasTakenPretest: false,
					banned: false,
				});
				await db.insert(accounts).values({
					id: generateRandomString(32, "a-z", "0-9"),
					accountId: devanId,
					providerId: "credential",
					userId: devanId,
					password: devanPasswordHash,
				});
				console.log("  User devan@gmail.com created");
			}

			const now = new Date();
			const activitySubs: {
				userId: string;
				chapterId: number;
				quizId: number;
				score: number;
				createdAt: Date;
			}[] = [];

			for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
				const date = new Date(
					Date.UTC(
						now.getUTCFullYear(),
						now.getUTCMonth(),
						now.getUTCDate() - dayOffset,
						faker.number.int({ min: 8, max: 20 }),
						faker.number.int({ min: 0, max: 59 }),
					),
				);

				const quizzesForDay = faker.helpers.arrayElements(
					allQuizData,
					faker.number.int({ min: 1, max: Math.min(4, allQuizData.length) }),
				);

				for (const quiz of quizzesForDay) {
					const retries = faker.number.int({ min: 1, max: 3 });
					for (let r = 0; r < retries; r++) {
						activitySubs.push({
							userId: devanId,
							chapterId: quiz.chapterId,
							quizId: quiz.quizId,
							score: faker.number.int({ min: 40, max: 100 }),
							createdAt: new Date(date.getTime() + r * 60_000),
						});
					}
				}
			}

			await db.insert(submissions).values(activitySubs);
			console.log(
				`  ${activitySubs.length} activity submissions for devan@gmail.com berhasil dimasukkan`,
			);
		}

		// Summary
		const totalPretests =
			pretestData.length + (scaleMode ? telcoPretestData.length : 0);
		console.log("\n===================================================");
		console.log(
			`     RINGKASAN SEEDING ${scaleMode ? "(SCALE)" : "(ESSENTIALS)"}`,
		);
		console.log("===================================================");
		console.log(`  Materi Pembelajaran : ${insertedMaterials.length}`);
		console.log(`  Bab                 : ${insertedChapters.length}`);
		console.log(`  Pertanyaan Pretes   : ${totalPretests}`);
		console.log(`  Kuis                : ${totalQuizzes}`);
		console.log(`  Pertanyaan Kuis     : ${totalQuestions}`);
		console.log(
			`  Opsi Jawaban        : ~${(totalPretests + totalQuestions) * 4}`,
		);
		if (scaleMode) {
			console.log(`  Sekolah             : ${schoolCount}`);
			console.log(`  Pengguna            : ${userCount}`);
			console.log(`  Quiz Submissions    : ${quizSubCount}`);
			console.log(`  Pretest Submissions : ${pretestSubCount}`);
		}
		console.log("===================================================");
		console.log("\nSeeding database berhasil diselesaikan!");
	} catch (error) {
		console.error("\nTerjadi kesalahan saat seeding:");
		console.error(error);
		process.exit(1);
	}

	process.exit(0);
}

seed();
