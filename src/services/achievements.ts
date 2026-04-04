import { desc, eq, sql } from "drizzle-orm";
import { Effect } from "effect";
import jsonLogic from "json-logic-js";
import {
	achievements,
	chapters,
	pretestSubmissions,
	quizzes,
	submissions,
	userAchievements,
} from "@/database/schema";
import { Db } from "@/lib/db";
import { dbTryPromise } from "@/lib/retry";
import { DatabaseError, NotFoundError } from "./errors/errors";

const buildContext = (userId: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const [userSubmissions, pretestRows, chapterQuizCounts] = yield* Effect.all(
			[
				dbTryPromise({
					try: () =>
						db
							.select({
								quizId: submissions.quizId,
								chapterId: submissions.chapterId,
								score: submissions.score,
							})
							.from(submissions)
							.where(eq(submissions.userId, userId)),
					catch: (err) =>
						new DatabaseError({
							cause: err,
							message: "Failed to fetch user submissions for achievements",
						}),
				}),
				dbTryPromise({
					try: () =>
						db
							.select({ isCorrect: pretestSubmissions.isCorrect })
							.from(pretestSubmissions)
							.where(eq(pretestSubmissions.userId, userId)),
					catch: (err) =>
						new DatabaseError({
							cause: err,
							message: "Failed to fetch pretest submissions for achievements",
						}),
				}),
				dbTryPromise({
					try: () =>
						db
							.select({
								id: chapters.id,
								quizCount: sql<number>`count(${quizzes.id})`.as("quiz_count"),
							})
							.from(chapters)
							.leftJoin(quizzes, eq(chapters.id, quizzes.chapterId))
							.groupBy(chapters.id),
					catch: (err) =>
						new DatabaseError({
							cause: err,
							message: "Failed to fetch chapter quiz counts for achievements",
						}),
				}),
			],
		);

		const bestScoreByQuiz = new Map<number, number>();
		for (const sub of userSubmissions) {
			const current = bestScoreByQuiz.get(sub.quizId) ?? 0;
			bestScoreByQuiz.set(sub.quizId, Math.max(current, sub.score ?? 0));
		}

		const completedByChapter = new Map<number, Set<number>>();
		for (const sub of userSubmissions) {
			if (sub.chapterId == null) continue;
			const set = completedByChapter.get(sub.chapterId) ?? new Set();
			set.add(sub.quizId);
			completedByChapter.set(sub.chapterId, set);
		}

		let chaptersCompleted = 0;
		for (const ch of chapterQuizCounts) {
			const quizCount = Number(ch.quizCount);
			if (quizCount === 0) continue;
			const completed = completedByChapter.get(ch.id);
			if (completed && completed.size >= quizCount) {
				chaptersCompleted++;
			}
		}

		const pretestCorrect = pretestRows.filter((p) => p.isCorrect).length;
		const pretestTotal = pretestRows.length;
		const allBestScores = [...bestScoreByQuiz.values()];
		const totalScore = allBestScores.reduce((sum, s) => sum + s, 0);
		const bestScore = allBestScores.length > 0 ? Math.max(...allBestScores) : 0;

		const context: AchievementContext = {
			pretest_taken: pretestTotal > 0,
			pretest_total: pretestTotal,
			pretest_correct: pretestCorrect,
			pretest_score:
				pretestTotal > 0
					? Math.round((pretestCorrect / pretestTotal) * 100)
					: 0,
			total_submissions: userSubmissions.length,
			best_score: bestScore,
			levels_completed: bestScoreByQuiz.size,
			chapters_completed: chaptersCompleted,
			total_score: totalScore,
			has_perfect_score: bestScore >= 100,
		};

		return context;
	});

export const evaluateUserAchievements = (userId: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const [allAchievements, alreadyUnlocked, context] = yield* Effect.all([
			dbTryPromise({
				try: () =>
					db
						.select()
						.from(achievements)
						.where(eq(achievements.isActive, true))
						.orderBy(achievements.id),
				catch: (err) =>
					new DatabaseError({
						cause: err,
						message: "Failed to fetch achievements",
					}),
			}),
			dbTryPromise({
				try: () =>
					db
						.select({
							achievementId: userAchievements.achievementId,
							unlockedAt: userAchievements.unlockedAt,
						})
						.from(userAchievements)
						.where(eq(userAchievements.userId, userId)),
				catch: (err) =>
					new DatabaseError({
						cause: err,
						message: "Failed to fetch user achievements",
					}),
			}),
			buildContext(userId),
		]);

		const unlockedMap = new Map(
			alreadyUnlocked.map((u) => [u.achievementId, u.unlockedAt]),
		);

		const newlyUnlocked: number[] = [];

		for (const achievement of allAchievements) {
			if (unlockedMap.has(achievement.id)) continue;

			const result = jsonLogic.apply(
				achievement.rule as jsonLogic.RulesLogic,
				context,
			);
			if (result) {
				newlyUnlocked.push(achievement.id);
			}
		}

		if (newlyUnlocked.length > 0) {
			yield* dbTryPromise({
				try: () =>
					db.insert(userAchievements).values(
						newlyUnlocked.map((achievementId) => ({
							userId,
							achievementId,
						})),
					),
				catch: (err) =>
					new DatabaseError({
						cause: err,
						message: "Failed to insert newly unlocked achievements",
					}),
			});
		}

		const freshUnlocked = yield* dbTryPromise({
			try: () =>
				db
					.select({
						achievementId: userAchievements.achievementId,
						unlockedAt: userAchievements.unlockedAt,
					})
					.from(userAchievements)
					.where(eq(userAchievements.userId, userId)),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: "Failed to re-fetch user achievements",
				}),
		});

		const freshMap = new Map(
			freshUnlocked.map((u) => [u.achievementId, u.unlockedAt]),
		);

		return {
			achievements: allAchievements.map((a) => ({
				id: a.slug,
				title: a.title,
				description: a.description,
				icon: a.icon,
				unlocked: freshMap.has(a.id),
				unlockedAt: freshMap.get(a.id)?.toISOString() ?? null,
			})),
		};
	});

export const fetchAllAchievements = Effect.gen(function* () {
	const { db } = yield* Db;

	return yield* dbTryPromise({
		try: () =>
			db.select().from(achievements).orderBy(desc(achievements.createdAt)),
		catch: (err) =>
			new DatabaseError({
				cause: err,
				message: "Failed to fetch achievements",
			}),
	});
});

export const fetchAchievementById = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* dbTryPromise({
			try: () =>
				db.select().from(achievements).where(eq(achievements.id, id)).limit(1),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to fetch achievement with id ${id}`,
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(
				new NotFoundError({ id, entity: "Achievement" }),
			);
		}

		return result[0];
	});

export const createAchievement = (data: {
	slug: string;
	title: string;
	description: string;
	icon?: string | null;
	rule: unknown;
}) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* dbTryPromise({
			try: () =>
				db
					.insert(achievements)
					.values({
						slug: data.slug,
						title: data.title,
						description: data.description,
						icon: data.icon ?? null,
						rule: data.rule,
					})
					.returning(),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: "Failed to create achievement",
				}),
		});

		return result[0];
	});

export const patchAchievement = (
	id: number,
	data: {
		slug?: string;
		title?: string;
		description?: string;
		icon?: string | null;
		rule?: unknown;
		isActive?: boolean;
	},
) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* dbTryPromise({
			try: () =>
				db
					.update(achievements)
					.set(data)
					.where(eq(achievements.id, id))
					.returning(),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to update achievement with id ${id}`,
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(
				new NotFoundError({ id, entity: "Achievement" }),
			);
		}

		return result[0];
	});

export const deleteAchievement = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		yield* dbTryPromise({
			try: () =>
				db
					.delete(userAchievements)
					.where(eq(userAchievements.achievementId, id)),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to delete user achievements for achievement ${id}`,
				}),
		});

		const result = yield* dbTryPromise({
			try: () =>
				db.delete(achievements).where(eq(achievements.id, id)).returning(),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to delete achievement with id ${id}`,
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(
				new NotFoundError({ id, entity: "Achievement" }),
			);
		}

		return result[0];
	});
