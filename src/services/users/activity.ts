import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { Effect } from "effect";
import { chapters, quizzes, submissions } from "@/database/schema";
import { Db } from "@/lib/db";
import { dbTryPromise } from "@/lib/retry";
import { DatabaseError } from "../errors/errors";

type EntryAccum = {
	quiz_id: number;
	quiz_level: number;
	count: number;
	latest_score: number;
	latest_time: Date;
};

type ChapterAccum = {
	chapter_id: number;
	chapter_title: string;
	entries: Map<number, EntryAccum>;
};

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

		const chapterIds = Array.from(
			new Set(rows.map((r) => r.chapterId).filter((id): id is number => !!id)),
		);

		const totals =
			chapterIds.length > 0
				? yield* dbTryPromise({
						try: () =>
							db
								.select({
									chapterId: quizzes.chapterId,
									totalLevels: sql<number>`count(${quizzes.id})::int`,
								})
								.from(quizzes)
								.where(inArray(quizzes.chapterId, chapterIds))
								.groupBy(quizzes.chapterId),
						catch: (err) =>
							new DatabaseError({
								cause: err,
								message: "Failed to fetch chapter totals",
							}),
					})
				: [];

		const totalByChapter = new Map<number, number>();
		for (const t of totals) {
			if (t.chapterId != null) totalByChapter.set(t.chapterId, t.totalLevels);
		}

		const dayMap = new Map<string, Map<number, ChapterAccum>>();

		for (const row of rows) {
			if (!row.quizId || !row.chapterId) continue;

			const dateKey = row.createdAt.toISOString().slice(0, 10);

			if (!dayMap.has(dateKey)) dayMap.set(dateKey, new Map());
			const chapterMap = dayMap.get(dateKey);
			if (!chapterMap) continue;

			let chapter = chapterMap.get(row.chapterId);
			if (!chapter) {
				chapter = {
					chapter_id: row.chapterId,
					chapter_title: row.chapterTitle,
					entries: new Map(),
				};
				chapterMap.set(row.chapterId, chapter);
			}

			const existing = chapter.entries.get(row.quizId);
			if (existing) {
				existing.count++;
				if (row.createdAt > existing.latest_time) {
					existing.latest_score = row.score ?? 0;
					existing.latest_time = row.createdAt;
				}
			} else {
				chapter.entries.set(row.quizId, {
					quiz_id: row.quizId,
					quiz_level: row.quizLevel,
					count: 1,
					latest_score: row.score ?? 0,
					latest_time: row.createdAt,
				});
			}
		}

		const activities = [];
		for (let i = 0; i < 7; i++) {
			const d = new Date(
				Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i),
			);
			const dateKey = d.toISOString().slice(0, 10);
			const chapterMap = dayMap.get(dateKey);

			const chapterGroups = chapterMap
				? Array.from(chapterMap.values()).map((c) => {
						const entriesArr = Array.from(c.entries.values()).sort(
							(a, b) => a.quiz_level - b.quiz_level,
						);
						const total = totalByChapter.get(c.chapter_id) ?? entriesArr.length;
						const levelsToday = entriesArr.length;
						const avg =
							levelsToday > 0
								? Math.round(
										entriesArr.reduce((s, e) => s + e.latest_score, 0) /
											levelsToday,
									)
								: 0;
						const pct =
							total > 0
								? Math.min(100, Math.round((levelsToday / total) * 100))
								: 0;
						return {
							chapter_id: c.chapter_id,
							chapter_title: c.chapter_title,
							total_levels: total,
							levels_completed_today: levelsToday,
							average_score: avg,
							completion_percentage: pct,
							entries: entriesArr.map((e) => ({
								quiz_id: e.quiz_id,
								quiz_level: e.quiz_level,
								retry_count: e.count,
								latest_score: e.latest_score,
								latest_time: e.latest_time.toISOString(),
							})),
						};
					})
				: [];

			const levelCount = chapterGroups.reduce(
				(s, g) => s + g.levels_completed_today,
				0,
			);

			activities.push({
				date: dateKey,
				level_count: levelCount,
				chapter_groups: chapterGroups,
			});
		}

		return { activities };
	});
