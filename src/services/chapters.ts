import { desc, eq, sql } from "drizzle-orm";
import { Effect } from "effect";
import {
	chapters,
	pretestSubmissions,
	questions,
	quizzes,
	submissions,
	users,
} from "@/database/schema";
import { Db } from "@/lib/db";
import { dbTryPromise } from "@/lib/retry";
import type { ChapterFormData } from "@/types/zod";
import { DatabaseError, NotFoundError } from "./errors/errors";

export const fetchAllChapters = Effect.gen(function* () {
	const { db } = yield* Db;

	return yield* dbTryPromise({
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

		const [chaptersData, userData] = yield* Effect.all([
			dbTryPromise({
				try: () =>
					db
						.select({
							id: chapters.id,
							title: chapters.title,
							description: chapters.description,
							mascotId: chapters.mascotId,
							quizCount: sql<number>`COUNT(${quizzes.id})::int`.as(
								"quiz_count",
							),
						})
						.from(chapters)
						.leftJoin(quizzes, eq(chapters.id, quizzes.chapterId))
						.where(eq(chapters.isHidden, false))
						.groupBy(
							chapters.id,
							chapters.title,
							chapters.description,
							chapters.mascotId,
						),
				catch: (err) =>
					new DatabaseError({
						cause: err,
						message: "Failed to fetch chapters",
					}),
			}),
			dbTryPromise({
				try: () =>
					db.execute(sql`
						WITH user_pretest AS (
							SELECT ${users.hasTakenPretest} AS has_taken_pretest
							FROM ${users}
							WHERE ${users.id} = ${userId}
							LIMIT 1
						),
						completed AS (
							SELECT ${submissions.chapterId} AS chapter_id,
								COUNT(DISTINCT ${submissions.quizId})::int AS count
							FROM ${submissions}
							WHERE ${submissions.userId} = ${userId}
							GROUP BY ${submissions.chapterId}
						),
						pretest_subs AS (
							SELECT ${questions.chapterId} AS chapter_id,
								${pretestSubmissions.isCorrect} AS is_correct
							FROM ${pretestSubmissions}
							INNER JOIN ${questions} ON ${pretestSubmissions.questionId} = ${questions.id}
							WHERE ${pretestSubmissions.userId} = ${userId}
						)
						SELECT
							'meta' AS row_type,
							(SELECT has_taken_pretest FROM user_pretest)::boolean AS val_bool,
							NULL::int AS chapter_id,
							NULL::int AS count,
							NULL::boolean AS is_correct
						UNION ALL
						SELECT
							'completed' AS row_type,
							NULL AS val_bool,
							chapter_id,
							count,
							NULL AS is_correct
						FROM completed
						UNION ALL
						SELECT
							'pretest' AS row_type,
							NULL AS val_bool,
							chapter_id,
							NULL AS count,
							is_correct
						FROM pretest_subs
					`),
				catch: (err) =>
					new DatabaseError({
						cause: err,
						message: "Failed to fetch user chapter data",
					}),
			}),
		]);

		type UserDataRow = {
			row_type: string;
			val_bool: boolean | null;
			chapter_id: number | null;
			count: number | null;
			is_correct: boolean | null;
		};
		const rows = userData.rows as UserDataRow[];

		let hasTakenPretest = false;
		const completedMap = new Map<number, number>();
		const pretestRows: Array<{
			chapterId: number | null;
			isCorrect: boolean | null;
		}> = [];

		for (const row of rows) {
			switch (row.row_type) {
				case "meta":
					hasTakenPretest = row.val_bool ?? false;
					break;
				case "completed":
					if (row.chapter_id != null) {
						completedMap.set(row.chapter_id, row.count ?? 0);
					}
					break;
				case "pretest":
					pretestRows.push({
						chapterId: row.chapter_id,
						isCorrect: row.is_correct,
					});
					break;
			}
		}

		if (!hasTakenPretest) {
			return {
				has_taken_pretest: false,
				chapters: chaptersData.map((ch) => ({
					id: ch.id,
					title: ch.title,
					description: ch.description,
					mascot_id: ch.mascotId,
					user_performance: null,
					quiz_count: Number(ch.quizCount),
					completed_quizzes: completedMap.get(ch.id) || 0,
				})),
			};
		}

		const performanceMap = new Map<number, { wrong: number; total: number }>();

		pretestRows.forEach((sub) => {
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
				quiz_count: Number(ch.quizCount),
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

export const fetchChapterById = (id: number, userId?: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		// Run chapter fetch and completed quizzes in parallel when userId is provided
		const [result, completedRows] = yield* Effect.all([
			dbTryPromise({
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
			}),
			userId
				? dbTryPromise({
						try: () =>
							db
								.select({
									quizId: submissions.quizId,
									score: submissions.score,
								})
								.from(submissions)
								.where(eq(submissions.userId, userId)),
						catch: (err) =>
							new DatabaseError({
								cause: err,
								message: `Failed to fetch completed quizzes for chapter ${id}`,
							}),
					})
				: Effect.succeed([] as { quizId: number; score: number | null }[]),
		]);

		if (result === undefined) {
			return yield* Effect.fail(new NotFoundError({ id, entity: "Chapter" }));
		}

		const completedQuizIds = completedRows.map((s) => s.quizId);
		const quizScores: Record<number, number> = {};
		for (const row of completedRows) {
			if (row.score != null) {
				quizScores[row.quizId] = row.score;
			}
		}

		return { ...result, completedQuizIds, quizScores };
	});

export const createChapter = (chapter: ChapterFormData) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* dbTryPromise({
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

		const result = yield* dbTryPromise({
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

export const hideChapter = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		yield* dbTryPromise({
			try: () => db.delete(submissions).where(eq(submissions.chapterId, id)),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to delete submissions for chapter ${id}`,
				}),
		});

		yield* dbTryPromise({
			try: () => db.delete(questions).where(eq(questions.chapterId, id)),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to delete questions for chapter ${id}`,
				}),
		});

		yield* dbTryPromise({
			try: () => db.delete(quizzes).where(eq(quizzes.chapterId, id)),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to delete quizzes for chapter ${id}`,
				}),
		});

		const result = yield* dbTryPromise({
			try: () =>
				db
					.update(chapters)
					.set({ isHidden: true })
					.where(eq(chapters.id, id))
					.returning(),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to hide chapter with id ${id}`,
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(new NotFoundError({ id, entity: "Chapter" }));
		}

		return result[0];
	});

export const unhideChapter = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* dbTryPromise({
			try: () =>
				db
					.update(chapters)
					.set({ isHidden: false })
					.where(eq(chapters.id, id))
					.returning(),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to unhide chapter with id ${id}`,
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(new NotFoundError({ id, entity: "Chapter" }));
		}

		return result[0];
	});
