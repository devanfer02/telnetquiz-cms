import { createInterface } from "node:readline";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { db, getDbMode, setDbMode } from "../../src/lib/db";
import { env } from "../../src/lib/env";
import {
	chapters,
	quizzes,
	questions,
	options,
	studyMaterials,
	submissions,
	pretestSubmissions,
} from "../../src/database/schema";
import { sql } from "drizzle-orm";

function maskDbUrl(url: string): string {
	return url.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:****@");
}

// ============================================================================
// TYPES
// ============================================================================

interface ChapterJson {
	chapter: {
		title: string;
		description: string;
		mascotId: number;
	};
	levels: LevelJson[];
}

interface LevelJson {
	title: string;
	level: number;
	difficulty: "easy" | "medium" | "hard";
	questions: QuestionJson[];
}

interface QuestionJson {
	description: string;
	question: string;
	imageLink: string | null;
	studyMaterial: {
		title: string;
		content: string;
		imageLink: string | null;
	};
	options: OptionJson[];
}

interface OptionJson {
	text: string;
	isCorrect: boolean;
}

interface PretestJson {
	questions: PretestQuestionJson[];
}

interface PretestQuestionJson {
	chapterRef: string;
	description: string;
	question: string;
	imageLink: string | null;
	options: OptionJson[];
}

// ============================================================================
// CLI HELPERS
// ============================================================================

const CONTENTS_DIR = join(import.meta.dir, "data", "prod");

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

function readJson<T>(filePath: string): T {
	const raw = readFileSync(filePath, "utf-8");
	return JSON.parse(raw) as T;
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateChapter(data: ChapterJson, fileName: string): string[] {
	const errors: string[] = [];
	const { chapter, levels } = data;

	if (!chapter?.title) errors.push(`${fileName}: chapter.title is required`);
	if (!chapter?.description)
		errors.push(`${fileName}: chapter.description is required`);
	if (!chapter?.mascotId) errors.push(`${fileName}: chapter.mascotId is required`);

	if (!Array.isArray(levels) || levels.length === 0) {
		errors.push(`${fileName}: levels array is required and must not be empty`);
		return errors;
	}

	for (const level of levels) {
		const prefix = `${fileName} level ${level.level}`;
		if (!level.title) errors.push(`${prefix}: title is required`);
		if (!level.level) errors.push(`${prefix}: level number is required`);
		if (!["easy", "medium", "hard"].includes(level.difficulty))
			errors.push(`${prefix}: difficulty must be easy/medium/hard`);

		if (!Array.isArray(level.questions) || level.questions.length === 0) {
			errors.push(`${prefix}: questions array is required`);
			continue;
		}

		for (let qi = 0; qi < level.questions.length; qi++) {
			const q = level.questions[qi];
			const qPrefix = `${prefix} Q${qi + 1}`;
			if (!q.question) errors.push(`${qPrefix}: question text is required`);
			if (!q.description) errors.push(`${qPrefix}: description is required`);
			if (!q.studyMaterial?.title)
				errors.push(`${qPrefix}: studyMaterial.title is required`);
			if (!q.studyMaterial?.content)
				errors.push(`${qPrefix}: studyMaterial.content is required`);

			if (!Array.isArray(q.options) || q.options.length < 2) {
				errors.push(`${qPrefix}: at least 2 options required`);
				continue;
			}

			const correctCount = q.options.filter((o) => o.isCorrect).length;
			if (correctCount !== 1)
				errors.push(
					`${qPrefix}: exactly 1 correct option required, found ${correctCount}`,
				);
		}
	}

	return errors;
}

function validatePretest(data: PretestJson, fileName: string): string[] {
	const errors: string[] = [];

	if (!Array.isArray(data.questions) || data.questions.length === 0) {
		errors.push(`${fileName}: questions array is required`);
		return errors;
	}

	for (let i = 0; i < data.questions.length; i++) {
		const q = data.questions[i];
		const prefix = `${fileName} Q${i + 1}`;
		if (!q.chapterRef) errors.push(`${prefix}: chapterRef is required`);
		if (!q.question) errors.push(`${prefix}: question text is required`);
		if (!q.description) errors.push(`${prefix}: description is required`);

		if (!Array.isArray(q.options) || q.options.length < 2) {
			errors.push(`${prefix}: at least 2 options required`);
			continue;
		}

		const correctCount = q.options.filter((o) => o.isCorrect).length;
		if (correctCount !== 1)
			errors.push(
				`${prefix}: exactly 1 correct option required, found ${correctCount}`,
			);
	}

	return errors;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
	console.log("=".repeat(60));
	console.log("  TelNetQuiz — Seed Actual Content");
	console.log("=".repeat(60));
	console.log();

	if (process.argv.includes("--testing")) {
		setDbMode("testing");
	}

	const mode = getDbMode();
	const dbUrl =
		mode === "testing" ? env.SUPABASE_DB_TESTING_URL : env.SUPABASE_DB_URL;
	console.log("[DB Target]");
	console.log(`  Mode: ${mode}`);
	console.log(`  URL:  ${maskDbUrl(dbUrl)}`);
	console.log();

	// Phase 0: Parse flags
	console.log("[Phase 0] Parsing flags...");
	console.log(`  --force:   ${flags.force}`);
	console.log(`  --dry-run: ${flags.dryRun}`);
	console.log();

	// Phase 1: Discover and read JSON content files
	console.log("[Phase 1] Reading and validating JSON content files...");

	let allFiles: string[];
	try {
		allFiles = readdirSync(CONTENTS_DIR).filter((f) => f.endsWith(".json"));
	} catch {
		console.error(`ERROR: Contents directory not found at ${CONTENTS_DIR}`);
		console.error("Create the directory and add JSON content files first.");
		process.exit(1);
	}

	const chapterFiles = allFiles
		.filter((f) => f.startsWith("chapter-"))
		.sort();
	const pretestFile = allFiles.find((f) => f === "pretest.json");

	if (chapterFiles.length === 0) {
		console.error("ERROR: No chapter-*.json files found in contents/");
		process.exit(1);
	}

	if (!pretestFile) {
		console.error("ERROR: pretest.json not found in contents/");
		process.exit(1);
	}

	const chapterDataList: ChapterJson[] = [];
	const allErrors: string[] = [];

	for (const file of chapterFiles) {
		const filePath = join(CONTENTS_DIR, file);
		try {
			const data = readJson<ChapterJson>(filePath);
			const errors = validateChapter(data, file);
			if (errors.length > 0) {
				allErrors.push(...errors);
			}

			const totalQuestions = data.levels.reduce(
				(sum, l) => sum + l.questions.length,
				0,
			);
			console.log(
				`  ${file} — OK (${data.levels.length} levels, ${totalQuestions} questions)`,
			);
			chapterDataList.push(data);
		} catch (err) {
			allErrors.push(
				`${file}: Failed to parse JSON — ${err instanceof Error ? err.message : err}`,
			);
		}
	}

	let pretestData: PretestJson;
	try {
		pretestData = readJson<PretestJson>(join(CONTENTS_DIR, pretestFile));
		const errors = validatePretest(pretestData, pretestFile);
		if (errors.length > 0) allErrors.push(...errors);
		console.log(
			`  ${pretestFile} — OK (${pretestData.questions.length} pretest questions)`,
		);
	} catch (err) {
		console.error(
			`ERROR: Failed to parse ${pretestFile} — ${err instanceof Error ? err.message : err}`,
		);
		process.exit(1);
	}

	if (allErrors.length > 0) {
		console.error("\nValidation errors:");
		for (const e of allErrors) console.error(`  - ${e}`);
		process.exit(1);
	}

	// Summary
	const totalLevels = chapterDataList.reduce(
		(sum, c) => sum + c.levels.length,
		0,
	);
	const totalQuizQuestions = chapterDataList.reduce(
		(sum, c) => sum + c.levels.reduce((s, l) => s + l.questions.length, 0),
		0,
	);
	const totalMaterials = totalQuizQuestions; // 1:1 mapping
	const totalPretestQuestions = pretestData.questions.length;
	const totalOptions =
		chapterDataList.reduce(
			(sum, c) =>
				sum +
				c.levels.reduce(
					(s, l) =>
						s + l.questions.reduce((os, q) => os + q.options.length, 0),
					0,
				),
			0,
		) +
		pretestData.questions.reduce((sum, q) => sum + q.options.length, 0);

	console.log();
	console.log(`  Total: ${chapterDataList.length} chapters, ${totalLevels} levels, ${totalMaterials} materials, ${totalQuizQuestions + totalPretestQuestions} questions, ${totalOptions} options`);
	console.log();

	// Phase 2: Confirmation
	if (flags.dryRun) {
		console.log("[Dry Run] Validation passed. No database changes made.");
		process.exit(0);
	}

	console.log("[Phase 2] Confirmation");
	console.log(
		"  WARNING: This will DELETE all existing content data:",
	);
	console.log(
		"    - All chapters (cascading: quizzes, questions, options, submissions)",
	);
	console.log("    - All study materials");
	console.log("    - All pretest submissions");
	console.log();

	const proceed = await confirm("  Continue?");
	if (!proceed) {
		console.log("Aborted.");
		process.exit(0);
	}

	console.log();

	// Phase 3: Wipe existing content
	console.log("[Phase 3] Wiping existing content...");
	await db.transaction(async (tx) => {
		await tx.delete(pretestSubmissions);
		await tx.delete(submissions);
		await tx.delete(options);
		await tx.delete(questions);
		await tx.delete(quizzes);
		await tx.delete(chapters);
		await tx.delete(studyMaterials);
	});
	console.log("  Existing content deleted.");
	console.log();

	// Reset sequences so IDs start from 1
	await db.execute(sql`ALTER SEQUENCE chapters_id_seq RESTART WITH 1`);
	await db.execute(sql`ALTER SEQUENCE quizzes_id_seq RESTART WITH 1`);
	await db.execute(sql`ALTER SEQUENCE questions_id_seq RESTART WITH 1`);
	await db.execute(sql`ALTER SEQUENCE options_id_seq RESTART WITH 1`);
	await db.execute(sql`ALTER SEQUENCE study_materials_id_seq RESTART WITH 1`);

	// Phase 4 + 5: Insert chapters, levels, materials, questions, options
	console.log("[Phase 4] Inserting chapters and content...");

	const chapterIdMap = new Map<string, number>();

	for (const chapterData of chapterDataList) {
		const [insertedChapter] = await db
			.insert(chapters)
			.values({
				title: chapterData.chapter.title,
				description: chapterData.chapter.description,
				mascotId: chapterData.chapter.mascotId,
			})
			.returning({ id: chapters.id });

		const chapterId = insertedChapter.id;
		chapterIdMap.set(chapterData.chapter.title, chapterId);
		console.log(
			`  Inserted chapter "${chapterData.chapter.title}" (id: ${chapterId})`,
		);

		for (const level of chapterData.levels) {
			await db.transaction(async (tx) => {
				// Insert quiz (level)
				const [insertedQuiz] = await tx
					.insert(quizzes)
					.values({
						chapterId,
						title: level.title,
						level: level.level,
						difficulty: level.difficulty,
					})
					.returning({ id: quizzes.id });

				const quizId = insertedQuiz.id;

				// Insert study materials for this level
				const materialsToInsert = level.questions.map((q) => ({
					title: q.studyMaterial.title,
					content: q.studyMaterial.content,
					imageLink: q.studyMaterial.imageLink ?? null,
				}));

				const insertedMaterials = await tx
					.insert(studyMaterials)
					.values(materialsToInsert)
					.returning({ id: studyMaterials.id });

				// Insert questions with materialId and quizId references
				const questionsToInsert = level.questions.map((q, idx) => ({
					type: "quiz" as const,
					chapterId,
					quizId,
					materialId: insertedMaterials[idx].id,
					imageLink: q.imageLink,
					description: q.description,
					question: q.question,
				}));

				const insertedQuestions = await tx
					.insert(questions)
					.values(questionsToInsert)
					.returning({ id: questions.id });

				// Insert options for all questions
				const allOptions = insertedQuestions.flatMap((iq, idx) =>
					level.questions[idx].options.map((opt) => ({
						questionId: iq.id,
						text: opt.text,
						isCorrect: opt.isCorrect,
					})),
				);

				await tx.insert(options).values(allOptions);
			});

			console.log(
				`    Level ${level.level} (${level.difficulty}): ${level.questions.length} questions, ${level.questions.length} materials`,
			);
		}
	}

	console.log();

	// Phase 6: Insert pretest questions
	console.log("[Phase 5] Inserting pretest questions...");

	await db.transaction(async (tx) => {
		for (const pq of pretestData.questions) {
			const chapterId = chapterIdMap.get(pq.chapterRef);
			if (!chapterId) {
				console.error(
					`  ERROR: chapterRef "${pq.chapterRef}" not found. Available: ${[...chapterIdMap.keys()].join(", ")}`,
				);
				process.exit(1);
			}

			const [insertedQuestion] = await tx
				.insert(questions)
				.values({
					type: "pretest",
					chapterId,
					quizId: null,
					materialId: null,
					imageLink: pq.imageLink,
					description: pq.description,
					question: pq.question,
				})
				.returning({ id: questions.id });

			await tx.insert(options).values(
				pq.options.map((opt) => ({
					questionId: insertedQuestion.id,
					text: opt.text,
					isCorrect: opt.isCorrect,
				})),
			);
		}
	});

	console.log(`  ${totalPretestQuestions} pretest questions inserted.`);
	console.log();

	// Phase 7: Summary
	console.log("=".repeat(60));
	console.log("     RINGKASAN SEEDING CONTENT");
	console.log("=".repeat(60));
	console.log(`  Bab                 : ${chapterDataList.length}`);
	console.log(`  Kuis (Level)        : ${totalLevels}`);
	console.log(`  Materi Pembelajaran : ${totalMaterials}`);
	console.log(`  Pertanyaan Kuis     : ${totalQuizQuestions}`);
	console.log(`  Pertanyaan Pretest  : ${totalPretestQuestions}`);
	console.log(`  Opsi Jawaban        : ${totalOptions}`);
	console.log("=".repeat(60));
	console.log();
	console.log("Seeding content berhasil diselesaikan!");

	process.exit(0);
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
