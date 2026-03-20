import { and, eq, gte } from "drizzle-orm";
import { Effect } from "effect";
import { chapters, quizzes, submissions } from "@/database/schema";
import { Db } from "@/lib/db";
import { dbTryPromise } from "@/lib/retry";
import { DatabaseError } from "./errors/errors";

export const fetchRecentActivity = (userId: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const now = new Date();
		const sevenDaysAgo = new Date(
			Date.UTC(
				now.getUTCFullYear(),
				now.getUTCMonth(),
				now.getUTCDate() - 6,
				0,
				0,
				0,
			),
		);

		const rows = yield* dbTryPromise({
			try: () =>
				db
					.select({
						submissionId: submissions.id,
						quizId: submissions.quizId,
						chapterId: submissions.chapterId,
						chapterTitle: chapters.title,
						quizLevel: quizzes.level,
						score: submissions.score,
						createdAt: submissions.createdAt,
					})
					.from(submissions)
					.innerJoin(quizzes, eq(submissions.quizId, quizzes.id))
					.innerJoin(chapters, eq(submissions.chapterId, chapters.id))
					.where(
						and(
							eq(submissions.userId, userId),
							gte(submissions.createdAt, sevenDaysAgo),
						),
					)
					.orderBy(submissions.createdAt),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: "Failed to fetch recent activity",
				}),
		});

		// Group by date + quizId
		const dayMap = new Map<
			string,
			Map<
				number,
				{
					quiz_id: number;
					chapter_id: number;
					chapter_title: string;
					quiz_level: number;
					count: number;
					latest_score: number;
					latest_time: Date;
				}
			>
		>();

		for (const row of rows) {
			if (!row.quizId || !row.chapterId) continue;

			const dateKey = row.createdAt.toISOString().slice(0, 10);

			if (!dayMap.has(dateKey)) {
				dayMap.set(dateKey, new Map());
			}
			const quizMap = dayMap.get(dateKey);
			if (!quizMap) continue;

			const existing = quizMap.get(row.quizId);
			if (existing) {
				existing.count++;
				if (row.createdAt > existing.latest_time) {
					existing.latest_score = row.score ?? 0;
					existing.latest_time = row.createdAt;
				}
			} else {
				quizMap.set(row.quizId, {
					quiz_id: row.quizId,
					chapter_id: row.chapterId,
					chapter_title: row.chapterTitle,
					quiz_level: row.quizLevel,
					count: 1,
					latest_score: row.score ?? 0,
					latest_time: row.createdAt,
				});
			}
		}

		// Build all 7 days (newest first)
		const activities = [];
		for (let i = 0; i < 7; i++) {
			const d = new Date(
				Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i),
			);
			const dateKey = d.toISOString().slice(0, 10);
			const quizMap = dayMap.get(dateKey);

			const entries = quizMap
				? Array.from(quizMap.values()).map((e) => ({
						quiz_id: e.quiz_id,
						chapter_id: e.chapter_id,
						chapter_title: e.chapter_title,
						quiz_level: e.quiz_level,
						retry_count: e.count,
						latest_score: e.latest_score,
					}))
				: [];

			activities.push({ date: dateKey, entries });
		}

		return { activities };
	});
