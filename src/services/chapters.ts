import { sql, eq, desc } from "drizzle-orm";
import {
	chapters,
	questions,
	pretestSubmissions,
	submissions,
} from "@/database/schema";
import { Db } from "@/lib/db";
import { ChapterFormData } from "@/types/zod";
import { Effect } from "effect";
import { DatabaseError, NotFoundError } from "./errors/errors";

export const fetchAllChapters = Effect.gen(function* () {
	const { db } = yield* Db;

	return yield* Effect.tryPromise({
		try: () => db.select().from(chapters).orderBy(desc(chapters.createdAt)),
		catch: (err) =>
			new DatabaseError({
				cause: err,
				message: "Failed to fetch chapters",
			}),
	});
});

export const fetchChaptersWithUserPerformance = (userId: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		// Check if user has taken pretest
		const pretestCount = yield* Effect.tryPromise({
			try: () =>
				db
					.select({ count: sql<number>`count(*)` })
					.from(pretestSubmissions)
					.where(eq(pretestSubmissions.userId, userId)),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: "Failed to check pretest status",
				}),
		});

		const hasTakenPretest = pretestCount[0].count > 0;

		// Fetch chapters with quizzes count
		const chaptersData = yield* Effect.tryPromise({
			try: () =>
				db.query.chapters.findMany({
					with: {
						quizzes: true,
					},
				}),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: "Failed to fetch chapters",
				}),
		});

		// Fetch completed quizzes count per chapter
		const completedQuizzes = yield* Effect.tryPromise({
			try: () =>
				db
					.select({
						chapterId: submissions.chapterId,
						count: sql<number>`count(distinct ${submissions.quizId})`,
					})
					.from(submissions)
					.where(eq(submissions.userId, userId))
					.groupBy(submissions.chapterId),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: "Failed to fetch completed quizzes",
				}),
		});

		const completedMap = new Map(
			completedQuizzes.map((c) => [c.chapterId, c.count]),
		);

		// If not taken pretest, return default
		if (!hasTakenPretest) {
			return {
				has_taken_pretest: false,
				chapters: chaptersData.map((ch) => ({
					id: ch.id,
					title: ch.title,
					description: ch.description,
					mascot_id: ch.mascotId,
					user_performance: null,
					quiz_count: ch.quizzes.length,
					completed_quizzes: completedMap.get(ch.id) || 0,
				})),
			};
		}

		// Calculate performance
		const userPretestSubmissions = yield* Effect.tryPromise({
			try: () =>
				db
					.select({
						chapterId: questions.chapterId,
						isCorrect: pretestSubmissions.isCorrect,
					})
					.from(pretestSubmissions)
					.innerJoin(questions, eq(pretestSubmissions.questionId, questions.id))
					.where(eq(pretestSubmissions.userId, userId)),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: "Failed to fetch pretest submissions",
				}),
		});

		const performanceMap = new Map<number, { wrong: number; total: number }>();

		userPretestSubmissions.forEach((sub) => {
			if (sub.chapterId) {
				const current = performanceMap.get(sub.chapterId) || {
					wrong: 0,
					total: 0,
				};
				current.total++;
				if (!sub.isCorrect) current.wrong++;
				performanceMap.set(sub.chapterId, current);
			}
		});

		const resultChapters = chaptersData.map((ch) => {
			const perf = performanceMap.get(ch.id);
			const wrong = perf?.wrong || 0;
			const total = perf?.total || 0;
			let accuracy = 0;
			if (total > 0) {
				accuracy = ((total - wrong) / total) * 100;
			}

			return {
				id: ch.id,
				title: ch.title,
				description: ch.description,
				mascot_id: ch.mascotId,
				user_performance: {
					wrong_answers: wrong,
					total_pretest_questions: total,
					accuracy_percentage: accuracy,
				},
				quiz_count: ch.quizzes.length,
				completed_quizzes: completedMap.get(ch.id) || 0,
			};
		});

		resultChapters.sort((a, b) => {
			const wrongA = a.user_performance?.wrong_answers || 0;
			const wrongB = b.user_performance?.wrong_answers || 0;
			if (wrongB !== wrongA) {
				return wrongB - wrongA;
			}
			return a.id - b.id;
		});

		return {
			has_taken_pretest: true,
			chapters: resultChapters,
		};
	});

export const fetchChapterById = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* Effect.tryPromise({
			try: () =>
				db.query.chapters.findFirst({
					where: eq(chapters.id, id),
					with: {
						quizzes: {
							extras: {
								numberOfQuestions: sql<number>`(
                SELECT count(*)
                FROM ${questions}
                WHERE "questions"."quizId" = "chapters_quizzes"."id"
              )`.as("numberOfQuestions"),
							},
						},
					},
				}),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to fetch chapter with id ${id}`,
				}),
		});

		if (result === undefined) {
			return yield* Effect.fail(new NotFoundError({ id, entity: "Chapter" }));
		}

		return result;
	});

export const createChapter = (chapter: ChapterFormData) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* Effect.tryPromise({
			try: () => db.insert(chapters).values(chapter).returning(),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to create chapter",
				}),
		});

		return result[0];
	});

export const patchChapter = (id: number, chapter: ChapterFormData) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* Effect.tryPromise({
			try: () =>
				db.update(chapters).set(chapter).where(eq(chapters.id, id)).returning(),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to update chapter with id ${id}`,
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(new NotFoundError({ id, entity: "Chapter" }));
		}

		return result[0];
	});

export const deleteChapter = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		yield* Effect.tryPromise({
			try: () => db.delete(chapters).where(eq(chapters.id, id)),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to delete chapter with id ${id}`,
				}),
		});

		return { success: true, id };
	});
