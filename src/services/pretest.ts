import { pretestSubmissions, questions, chapters } from "@/database/schema";
import { Db } from "@/lib/db";
import { eq, inArray } from "drizzle-orm";
import { Effect } from "effect";
import { DatabaseError, ValidationError } from "./errors/errors";

export const submitPretest = (
	userId: string,
	submissions: PretestSubmissionItem[],
) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		// Check if user already submitted
		const existingSubmission = yield* Effect.tryPromise({
			try: () =>
				db.query.pretestSubmissions.findFirst({
					where: eq(pretestSubmissions.userId, userId),
				}),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: "Failed to check existing submissions",
				}),
		});

		if (existingSubmission) {
			return yield* Effect.fail(
				new ValidationError({
					errors: { message: "User has already submitted pretest" },
				}),
			);
		}

		// Validate questions
		const questionIds = submissions.map((s) => s.question_id);
		if (questionIds.length === 0) {
			return yield* Effect.fail(
				new ValidationError({
					errors: { message: "No submissions provided" },
				}),
			);
		}

		const validQuestions = yield* Effect.tryPromise({
			try: () =>
				db.query.questions.findMany({
					where: inArray(questions.id, questionIds),
					with: {
						options: true,
					},
				}),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: "Failed to fetch questions",
				}),
		});

		if (validQuestions.length !== submissions.length) {
			// Find missing ids
			const fetchedIds = new Set(validQuestions.map((q) => q.id));
			const missingId = questionIds.find((id) => !fetchedIds.has(id));
			return yield* Effect.fail(
				new ValidationError({
					errors: { message: `Invalid question_id: ${missingId}` },
				}),
			);
		}

		// Check if all are pretest type
		const nonPretest = validQuestions.find((q) => q.type !== "pretest");
		if (nonPretest) {
			return yield* Effect.fail(
				new ValidationError({
					errors: {
						message: `Question ${nonPretest.id} is not a pretest question`,
					},
				}),
			);
		}

		// Calculate results and prepare insert
		const submissionsToInsert: (typeof pretestSubmissions.$inferInsert)[] = [];
		let correctCount = 0;
		let incorrectCount = 0;
		const chapterWrongCounts: Record<number, number> = {};
		const chapterTotalQuestions: Record<number, number> = {};

		// Initialize chapter counters
		validQuestions.forEach((q) => {
			if (q.chapterId) {
				chapterTotalQuestions[q.chapterId] =
					(chapterTotalQuestions[q.chapterId] || 0) + 1;
				if (!(q.chapterId in chapterWrongCounts)) {
					chapterWrongCounts[q.chapterId] = 0;
				}
			}
		});

		for (const sub of submissions) {
			const question = validQuestions.find((q) => q.id === sub.question_id);
			if (!question) continue;

			const correctOption = question.options.find((o) => o.isCorrect);

			const isCorrect = correctOption?.id === sub.answered_option_id;

			if (isCorrect) {
				correctCount++;
			} else {
				incorrectCount++;
				if (question.chapterId) {
					chapterWrongCounts[question.chapterId] =
						(chapterWrongCounts[question.chapterId] || 0) + 1;
				}
			}

			submissionsToInsert.push({
				userId,
				questionId: sub.question_id,
				answeredOptionId: sub.answered_option_id,
				isCorrect,
			});
		}

		// Insert submissions
		yield* Effect.tryPromise({
			try: () => db.insert(pretestSubmissions).values(submissionsToInsert),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: "Failed to save submissions",
				}),
		});

		// Fetch chapter details for response
		const chapterIds = Object.keys(chapterWrongCounts).map(Number);
		let chapterDetails: { id: number; title: string }[] = [];

		if (chapterIds.length > 0) {
			chapterDetails = yield* Effect.tryPromise({
				try: () =>
					db
						.select({
							id: chapters.id,
							title: chapters.title,
						})
						.from(chapters)
						.where(inArray(chapters.id, chapterIds)),
				catch: (err) =>
					new DatabaseError({
						cause: err,
						message: "Failed to fetch chapters",
					}),
			});
		}

		const chapterWeaknesses = chapterDetails
			.map((ch) => ({
				chapter_id: ch.id,
				chapter_title: ch.title,
				wrong_count: chapterWrongCounts[ch.id] || 0,
				total_questions: chapterTotalQuestions[ch.id] || 0,
			}))
			.sort((a, b) => b.wrong_count - a.wrong_count);

		return {
			total_questions: submissions.length,
			correct_answers: correctCount,
			incorrect_answers: incorrectCount,
			score_percentage: (correctCount / submissions.length) * 100,
			chapter_weaknesses: chapterWeaknesses,
		};
	});
