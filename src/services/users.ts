import { getRequestHeaders } from "@tanstack/react-start/server";
import { desc, eq, sql } from "drizzle-orm";
import { Effect } from "effect";
import {
	chapters,
	pretestSubmissions,
	quizzes,
	schools,
	sessions,
	submissions,
	users,
} from "@/database/schema";
import { Auth } from "@/lib/auth/server";
import { Db } from "@/lib/db";
import { dbTryPromise } from "@/lib/retry";
import type { EditUserFormData } from "@/types/zod";
import type { UpdateProfileFormData } from "@/types/zod.api";
import { AuthError, DatabaseError, NotFoundError } from "./errors/errors";

export const patchUser = (id: string, user: EditUserFormData) =>
	Effect.gen(function* () {
		const { db } = yield* Db;
		const { auth } = yield* Auth;

		const result = yield* dbTryPromise({
			try: () =>
				db
					.update(users)
					.set({
						name: user.fullname,
						email: user.email,
						...(user.schoolId !== undefined && { schoolId: user.schoolId }),
						...(user.gender !== undefined && { gender: user.gender }),
						...(user.grade !== undefined &&
							user.grade !== "" && { grade: user.grade }),
					})
					.where(eq(users.id, id))
					.returning(),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to update user with id ${id}`,
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(new NotFoundError({ id, entity: "User" }));
		}

		const password = user.password;
		const headers = getRequestHeaders();
		console.log(headers);

		if (password) {
			yield* Effect.tryPromise({
				try: () =>
					auth.api.setUserPassword({
						body: {
							newPassword: password,
							userId: result[0].id,
						},
						headers: headers,
					}),
				catch: (err) => {
					return new AuthError({
						message: (err as Error).message,
					});
				},
			});
		}

		return result[0];
	});

export const deleteUser = (id: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		yield* dbTryPromise({
			try: () => db.delete(users).where(eq(users.id, id)),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to delete user with id ${id}`,
				}),
		});

		return { success: true, id };
	});

export const fetchLeaderboard = (
	userId: string,
	limit: number,
	cursor?: number,
) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const leaderboardQuery = db
			.select({
				userId: users.id,
				fullname: users.name,
				image: users.image,
				gender: users.gender,
				totalScore: sql<number>`COALESCE(SUM(${submissions.score}), 0)`.as(
					"total_score",
				),
			})
			.from(users)
			.leftJoin(submissions, eq(users.id, submissions.userId))
			.groupBy(users.id, users.name, users.image, users.gender)
			.orderBy(desc(sql`total_score`), users.id)
			.limit(limit + 1);

		const leaderboard = yield* dbTryPromise({
			try: () => (cursor ? leaderboardQuery.offset(cursor) : leaderboardQuery),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to fetch leaderboard",
				}),
		});

		const hasNextPage = leaderboard.length > limit;
		const items = hasNextPage ? leaderboard.slice(0, limit) : leaderboard;
		const nextCursor = hasNextPage ? (cursor ?? 0) + limit : null;

		const [userRankResult, userScoreResult] = yield* Effect.all([
			dbTryPromise({
				try: () =>
					db.execute(sql`
						SELECT rank FROM (
							SELECT
								${users.id} as user_id,
								ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(${submissions.score}), 0) DESC, ${users.id}) as rank
							FROM ${users}
							LEFT JOIN ${submissions} ON ${users.id} = ${submissions.userId}
							GROUP BY ${users.id}
						) ranked
						WHERE user_id = ${userId}
					`),
				catch: (error) =>
					new DatabaseError({
						cause: error,
						message: "Failed to fetch user rank",
					}),
			}),
			dbTryPromise({
				try: () =>
					db
						.select({
							fullname: users.name,
							image: users.image,
							gender: users.gender,
							totalScore:
								sql<number>`COALESCE(SUM(${submissions.score}), 0)`.as(
									"total_score",
								),
						})
						.from(users)
						.leftJoin(submissions, eq(users.id, submissions.userId))
						.where(eq(users.id, userId))
						.groupBy(users.id, users.name, users.image, users.gender),
				catch: (error) =>
					new DatabaseError({
						cause: error,
						message: "Failed to fetch user score",
					}),
			}),
		]);

		const userRank = userRankResult.rows[0]?.rank as number | null;
		const currentUser = userScoreResult[0] ?? null;

		return {
			leaderboard: items.map((item, index) => ({
				rank: (cursor ?? 0) + index + 1,
				userId: item.userId,
				fullname: item.fullname,
				image: item.image,
				gender: item.gender,
				totalScore: Number(item.totalScore),
			})),
			currentUser: currentUser
				? {
						rank: Number(userRank),
						fullname: currentUser.fullname,
						image: currentUser.image,
						gender: currentUser.gender,
						totalScore: Number(currentUser.totalScore),
					}
				: null,
			pagination: {
				nextCursor,
				hasNextPage,
			},
		};
	});

function parseDateAsUTC(dateString: string): number {
	const [year, month, day] = dateString.split("-").map(Number);
	return Date.UTC(year, month - 1, day);
}

function computeDailyStreak(dateRows: Array<{ d: string }>): number {
	if (dateRows.length === 0) return 0;

	const MS_PER_DAY = 24 * 60 * 60 * 1000;
	const mostRecentTs = parseDateAsUTC(dateRows[0].d);

	const now = new Date();
	const todayTs = Date.UTC(
		now.getUTCFullYear(),
		now.getUTCMonth(),
		now.getUTCDate(),
	);

	if ((todayTs - mostRecentTs) / MS_PER_DAY > 1) return 0;

	let streak = 1;
	let lastTs = mostRecentTs;

	for (let i = 1; i < dateRows.length; i++) {
		const currentTs = parseDateAsUTC(dateRows[i].d);
		if (lastTs - currentTs === MS_PER_DAY) {
			streak++;
			lastTs = currentTs;
		} else {
			break;
		}
	}
	return streak;
}

const fetchUserStats = (userId: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* dbTryPromise({
			try: () =>
				db.execute(sql`
					WITH user_score AS (
						SELECT
							COALESCE(SUM(${submissions.score}), 0)::int AS total_score,
							COUNT(DISTINCT ${submissions.quizId})::int AS levels_completed
						FROM ${submissions}
						WHERE ${submissions.userId} = ${userId}
					),
					chapter_stats AS (
						SELECT
							COUNT(*)::int AS total_chapters,
							COUNT(*) FILTER (WHERE completed_count >= quiz_count)::int AS chapters_completed
						FROM (
							SELECT
								${chapters.id},
								COUNT(DISTINCT ${quizzes.id})::int AS quiz_count,
								COUNT(DISTINCT ${submissions.quizId})::int AS completed_count
							FROM ${chapters}
							LEFT JOIN ${quizzes} ON ${quizzes.chapterId} = ${chapters.id}
							LEFT JOIN ${submissions} ON ${submissions.quizId} = ${quizzes.id} AND ${submissions.userId} = ${userId}
							WHERE ${chapters.isHidden} = false
							GROUP BY ${chapters.id}
							HAVING COUNT(DISTINCT ${quizzes.id}) > 0
						) cs
					),
					streak_dates AS (
						SELECT ARRAY_AGG(d ORDER BY d DESC) AS dates FROM (
							SELECT DISTINCT DATE(${submissions.createdAt}) AS d
							FROM ${submissions}
							WHERE ${submissions.userId} = ${userId}
						) ds
					)
					SELECT us.total_score, us.levels_completed, cs.total_chapters, cs.chapters_completed, sd.dates
					FROM user_score us, chapter_stats cs, streak_dates sd
				`),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to fetch user stats",
				}),
		});

		const row = userStatsRowSchema.parse(result.rows[0] ?? {});
		const dailyStreak = computeDailyStreak(
			(row.dates ?? []).map((d) => ({ d })),
		);

		return {
			total_score: row.total_score,
			levels_completed: row.levels_completed,
			chapters_completed: row.chapters_completed,
			total_chapters: row.total_chapters,
			daily_streak: dailyStreak,
		};
	});

export const fetchUserProfile = (userId: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const [userResult, stats] = yield* Effect.all([
			dbTryPromise({
				try: () =>
					db
						.select({
							id: users.id,
							name: users.name,
							email: users.email,
							image: users.image,
							bio: users.bio,
							gender: users.gender,
							grade: users.grade,
							schoolId: users.schoolId,
							schoolName: schools.name,
							createdAt: users.createdAt,
							updatedAt: users.updatedAt,
							hasTakenPretest: users.hasTakenPretest,
						})
						.from(users)
						.leftJoin(schools, eq(users.schoolId, schools.id))
						.where(eq(users.id, userId))
						.limit(1),
				catch: (error) =>
					new DatabaseError({
						cause: error,
						message: "Failed to fetch user profile",
					}),
			}),
			fetchUserStats(userId),
		]);

		if (userResult.length === 0) {
			return yield* Effect.fail(
				new NotFoundError({ id: userId, entity: "User" }),
			);
		}

		const user = userResult[0];

		return {
			id: user.id,
			fullname: user.name,
			email: user.email,
			image: user.image,
			bio: user.bio,
			gender: user.gender,
			grade: user.grade,
			school: user.schoolName
				? { id: user.schoolId ?? 0, name: user.schoolName }
				: null,
			has_taken_pretest: user.hasTakenPretest,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			stats,
		};
	});

export const updateUserProfile = (
	userId: string,
	data: UpdateProfileFormData,
) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const updateData: Partial<{ name: string; image: string; bio: string }> =
			{};

		if (data.fullname) {
			updateData.name = data.fullname;
		}

		if (data.image) {
			updateData.image = data.image;
		}

		if (data.bio !== undefined) {
			updateData.bio = data.bio;
		}

		if (Object.keys(updateData).length === 0) {
			return yield* fetchUserProfile(userId);
		}

		const [updateResult, userResult, stats] = yield* Effect.all([
			dbTryPromise({
				try: () =>
					db
						.update(users)
						.set(updateData)
						.where(eq(users.id, userId))
						.returning(),
				catch: (error) =>
					new DatabaseError({
						cause: error,
						message: "Failed to update user profile",
					}),
			}),
			dbTryPromise({
				try: () =>
					db
						.select({
							schoolId: users.schoolId,
							schoolName: schools.name,
						})
						.from(users)
						.leftJoin(schools, eq(users.schoolId, schools.id))
						.where(eq(users.id, userId))
						.limit(1),
				catch: (error) =>
					new DatabaseError({
						cause: error,
						message: "Failed to fetch user school",
					}),
			}),
			fetchUserStats(userId),
		]);

		if (updateResult.length === 0) {
			return yield* Effect.fail(
				new NotFoundError({ id: userId, entity: "User" }),
			);
		}

		const updatedUser = updateResult[0];
		const schoolData = userResult[0];

		return {
			id: updatedUser.id,
			fullname: updatedUser.name,
			email: updatedUser.email,
			image: updatedUser.image,
			bio: updatedUser.bio,
			gender: updatedUser.gender,
			grade: updatedUser.grade,
			school: schoolData?.schoolName
				? { id: schoolData.schoolId ?? 0, name: schoolData.schoolName }
				: null,
			has_taken_pretest: updatedUser.hasTakenPretest,
			createdAt: updatedUser.createdAt,
			updatedAt: updatedUser.updatedAt,
			stats,
		};
	});

export const fetchUserSessions = (userId: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* dbTryPromise({
			try: () =>
				db
					.select()
					.from(sessions)
					.where(eq(sessions.userId, userId))
					.orderBy(desc(sessions.createdAt)),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to fetch sessions for user ${userId}`,
				}),
		});

		return result;
	});

export const revokeSession = (sessionId: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* dbTryPromise({
			try: () =>
				db.delete(sessions).where(eq(sessions.id, sessionId)).returning(),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to revoke session ${sessionId}`,
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(
				new NotFoundError({ id: sessionId, entity: "Session" }),
			);
		}

		return { success: true, id: sessionId };
	});

export const revokeAllUserSessions = (userId: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		yield* dbTryPromise({
			try: () => db.delete(sessions).where(eq(sessions.userId, userId)),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to revoke all sessions for user ${userId}`,
				}),
		});

		return { success: true, userId };
	});

export const fetchUserDetail = (userId: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* dbTryPromise({
			try: () =>
				db
					.select({
						id: users.id,
						name: users.name,
						email: users.email,
						image: users.image,
						bio: users.bio,
						gender: users.gender,
						grade: users.grade,
						schoolId: users.schoolId,
						schoolName: schools.name,
						hasTakenPretest: users.hasTakenPretest,
						createdAt: users.createdAt,
						updatedAt: users.updatedAt,
					})
					.from(users)
					.leftJoin(schools, eq(users.schoolId, schools.id))
					.where(eq(users.id, userId))
					.limit(1),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to fetch user",
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(
				new NotFoundError({ id: userId, entity: "User" }),
			);
		}

		const user = result[0];

		const userSubmissions = yield* dbTryPromise({
			try: () =>
				db.query.submissions.findMany({
					where: eq(submissions.userId, userId),
					orderBy: desc(submissions.createdAt),
					with: {
						chapter: true,
						quiz: true,
					},
				}),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to fetch user submissions",
				}),
		});

		const userPretestSubmissions = yield* dbTryPromise({
			try: () =>
				db.query.pretestSubmissions.findMany({
					where: eq(pretestSubmissions.userId, userId),
					with: {
						question: true,
						answeredOption: true,
					},
				}),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to fetch user pretest submissions",
				}),
		});

		const totalScore = userSubmissions.reduce(
			(sum, s) => sum + (s.score ?? 0),
			0,
		);
		const levelsCompleted = new Set(userSubmissions.map((s) => s.quizId)).size;

		const allChaptersData = yield* dbTryPromise({
			try: () =>
				db
					.select({
						id: chapters.id,
						quizCount: sql<number>`count(${quizzes.id})`.as("quiz_count"),
					})
					.from(chapters)
					.leftJoin(quizzes, eq(chapters.id, quizzes.chapterId))
					.groupBy(chapters.id),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to fetch chapters for stats",
				}),
		});

		const completedByChapter = new Map<number, Set<number>>();
		for (const sub of userSubmissions) {
			if (sub.chapterId == null || sub.quizId == null) continue;
			const set = completedByChapter.get(sub.chapterId) ?? new Set();
			set.add(sub.quizId);
			completedByChapter.set(sub.chapterId, set);
		}

		let chaptersCompleted = 0;
		for (const chapter of allChaptersData) {
			const quizCount = Number(chapter.quizCount);
			if (quizCount === 0) continue;
			const completed = completedByChapter.get(chapter.id);
			if (completed && completed.size >= quizCount) {
				chaptersCompleted++;
			}
		}

		const pretestCorrect = userPretestSubmissions.filter(
			(p) => p.isCorrect,
		).length;
		const pretestTotal = userPretestSubmissions.length;

		return {
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				image: user.image,
				bio: user.bio,
				gender: user.gender,
				grade: user.grade,
				school: user.schoolName
					? { id: user.schoolId ?? 0, name: user.schoolName }
					: null,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			},
			stats: {
				totalScore,
				levelsCompleted,
				chaptersCompleted,
				totalSubmissions: userSubmissions.length,
				pretestTaken: pretestTotal > 0,
				pretestScore:
					pretestTotal > 0
						? Math.round((pretestCorrect / pretestTotal) * 100)
						: null,
				pretestCorrect,
				pretestTotal,
			},
			submissions: userSubmissions.map((s) => ({
				id: s.id,
				chapterTitle: s.chapter?.title ?? "-",
				quizLevel: s.quiz?.level ?? 0,
				score: s.score ?? 0,
				createdAt: s.createdAt?.toISOString() ?? "",
			})),
			pretestSubmissions: userPretestSubmissions.map((p) => ({
				id: p.id,
				question: p.question?.question ?? "-",
				description: p.question?.description ?? "",
				answeredOption: p.answeredOption?.text ?? "-",
				isCorrect: p.isCorrect,
			})),
		};
	});

export const resetUserProgress = (userId: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		yield* dbTryPromise({
			try: () => db.delete(submissions).where(eq(submissions.userId, userId)),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to delete submissions for user ${userId}`,
				}),
		});

		yield* dbTryPromise({
			try: () =>
				db
					.delete(pretestSubmissions)
					.where(eq(pretestSubmissions.userId, userId)),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to delete pretest submissions for user ${userId}`,
				}),
		});

		yield* dbTryPromise({
			try: () =>
				db
					.update(users)
					.set({ hasTakenPretest: false })
					.where(eq(users.id, userId)),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to reset pretest status for user ${userId}`,
				}),
		});

		return { success: true, userId };
	});

export const fetchUserAchievements = (userId: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* dbTryPromise({
			try: () =>
				db.execute(sql`
					WITH pretest AS (
						SELECT ${pretestSubmissions.createdAt} AS d
						FROM ${pretestSubmissions}
						WHERE ${pretestSubmissions.userId} = ${userId}
						ORDER BY ${pretestSubmissions.createdAt} ASC
						LIMIT 1
					),
					first_quiz AS (
						SELECT ${submissions.createdAt} AS d
						FROM ${submissions}
						WHERE ${submissions.userId} = ${userId}
						ORDER BY ${submissions.createdAt} ASC
						LIMIT 1
					),
					perfect AS (
						SELECT ${submissions.createdAt} AS d
						FROM ${submissions}
						WHERE ${submissions.userId} = ${userId} AND ${submissions.score} = 100
						ORDER BY ${submissions.createdAt} ASC
						LIMIT 1
					),
					mastery AS (
						SELECT MAX(${submissions.createdAt}) AS d
						FROM ${chapters}
						JOIN ${quizzes} ON ${quizzes.chapterId} = ${chapters.id}
						LEFT JOIN ${submissions} ON ${submissions.quizId} = ${quizzes.id}
							AND ${submissions.userId} = ${userId}
						GROUP BY ${chapters.id}
						HAVING COUNT(DISTINCT ${quizzes.id}) = COUNT(DISTINCT ${submissions.quizId})
							AND COUNT(DISTINCT ${quizzes.id}) > 0
						ORDER BY d ASC NULLS LAST
						LIMIT 1
					)
					SELECT
						(SELECT d FROM pretest) AS pretest_date,
						(SELECT d FROM first_quiz) AS first_quiz_date,
						(SELECT d FROM perfect) AS perfect_score_date,
						(SELECT d FROM mastery) AS mastery_date
				`),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: "Failed to fetch user achievements",
				}),
		});

		const row = achievementRowSchema.parse(result.rows[0] ?? {});

		return {
			achievements: [
				{
					id: "pretest_complete",
					title: "Penjelajah Pretest",
					description: "Menyelesaikan pretest",
					unlocked: row.pretest_date != null,
					unlockedAt: row.pretest_date
						? new Date(row.pretest_date).toISOString()
						: null,
				},
				{
					id: "first_quiz",
					title: "Kuis Pertama",
					description: "Menyelesaikan kuis pertama",
					unlocked: row.first_quiz_date != null,
					unlockedAt: row.first_quiz_date
						? new Date(row.first_quiz_date).toISOString()
						: null,
				},
				{
					id: "perfect_score",
					title: "Nilai Sempurna",
					description: "Mendapatkan nilai 100 pada kuis",
					unlocked: row.perfect_score_date != null,
					unlockedAt: row.perfect_score_date
						? new Date(row.perfect_score_date).toISOString()
						: null,
				},
				{
					id: "chapter_master",
					title: "Penguasa Bab",
					description: "Menyelesaikan semua kuis dalam satu bab",
					unlocked: row.mastery_date != null,
					unlockedAt: row.mastery_date
						? new Date(row.mastery_date).toISOString()
						: null,
				},
			],
		};
	});
