import { eq, inArray } from "drizzle-orm";
import { Effect } from "effect";
import {
	chapters,
	pretestSubmissions,
	questions,
	users,
} from "@/database/schema";
import { Db } from "@/lib/db";
import { dbTryPromise } from "@/lib/retry";
import {
	DatabaseError,
	NotFoundError,
	ValidationError,
} from "../errors/errors";

export const verifyPretestAnswer = (
	questionId: number,
	answeredOptionId: number,
) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const question = yield* dbTryPromise({
			try: () =>
				db.query.questions.findFirst({
					where: eq(questions.id, questionId),
					with: {
						options: true,
					},
				}),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to fetch question ${questionId}`,
				}),
		});

		if (!question) {
			return yield* Effect.fail(
				new NotFoundError({ id: questionId, entity: "Question" }),
			);
		}

		if (question.type !== "pretest") {
			return yield* Effect.fail(
				new ValidationError({
					errors: {
						message: `Question ${questionId} is not a pretest question`,
					},
				}),
			);
		}

		const correctOption = question.options.find((o) => o.isCorrect);

		return {
			correct: correctOption?.id === answeredOptionId,
			correct_option_id: correctOption?.id ?? 0,
		};
	});

export const checkPretestStatus = (userId: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* dbTryPromise({
			try: () =>
				db
					.select({ hasTakenPretest: users.hasTakenPretest })
					.from(users)
					.where(eq(users.id, userId))
					.limit(1),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: "Failed to check pretest status",
				}),
		});

		return {
			has_taken_pretest: result[0]?.hasTakenPretest ?? false,
		};
	});

export const submitPretest = (
	userId: string,
	submissions: PretestSubmissionItem[],
) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const existingSubmission = yield* dbTryPromise({
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

		const questionIds = submissions.map((s) => s.question_id);
		if (questionIds.length === 0) {
			return yield* Effect.fail(
				new ValidationError({
					errors: { message: "No submissions provided" },
				}),
			);
		}

		const validQuestions = yield* dbTryPromise({
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
			const fetchedIds = new Set(validQuestions.map((q) => q.id));
			const missingId = questionIds.find((id) => !fetchedIds.has(id));
			return yield* Effect.fail(
				new ValidationError({
					errors: { message: `Invalid question_id: ${missingId}` },
				}),
			);
		}

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

		const submissionsToInsert: (typeof pretestSubmissions.$inferInsert)[] = [];
		let correctCount = 0;
		let incorrectCount = 0;
		const chapterWrongCounts: Record<number, number> = {};
		const chapterTotalQuestions: Record<number, number> = {};

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

		yield* dbTryPromise({
			try: () => db.insert(pretestSubmissions).values(submissionsToInsert),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: "Failed to save submissions",
				}),
		});

		yield* dbTryPromise({
			try: () =>
				db
					.update(users)
					.set({ hasTakenPretest: true })
					.where(eq(users.id, userId)),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: "Failed to update pretest status",
				}),
		});

		const chapterIds = Object.keys(chapterWrongCounts).map(Number);
		let chapterDetails: { id: number; title: string }[] = [];

		if (chapterIds.length > 0) {
			chapterDetails = yield* dbTryPromise({
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
