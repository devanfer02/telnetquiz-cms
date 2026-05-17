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
	userAchievements,
	users,
} from "@/database/schema";
import { Auth } from "@/lib/auth/server";
import { Db } from "@/lib/db";
import { dbTryPromise } from "@/lib/retry";
import type { EditUserFormData } from "@/types/zod";
import type { UpdateProfileFormData } from "@/types/zod.api";
import { AuthError, DatabaseError, NotFoundError } from "../errors/errors";
import {
	deleteRefreshTokensBySession,
	deleteRefreshTokensByUser,
} from "./refresh-tokens";

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

export type LeaderboardPeriod = "week" | "month" | "all";

type LeaderboardRow = {
	user_id: string;
	fullname: string | null;
	image: string | null;
	gender: boolean | null;
	total_score: number | string;
	rank: number | string;
	prev_rank: number | string | null;
};

const periodWindowDays: Record<Exclude<LeaderboardPeriod, "all">, number> = {
	week: 7,
	month: 30,
};

export const fetchLeaderboard = (
	userId: string,
	limit: number,
	cursor?: number,
	period: LeaderboardPeriod = "all",
) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const offset = cursor ?? 0;

		const buildQuery = () => {
			if (period === "all") {
				return sql`
					WITH user_scores AS (
						SELECT
							u.id AS user_id,
							u.fullname,
							u.image,
							u.gender,
							COALESCE((
								SELECT SUM(best.max_score) FROM (
									SELECT MAX(${submissions.score}) AS max_score
									FROM ${submissions}
									WHERE ${submissions.userId} = u.id
									GROUP BY ${submissions.quizId}
								) best
							), 0) AS total_score
						FROM ${users} u
					),
					ranked AS (
						SELECT
							user_id, fullname, image, gender, total_score,
							ROW_NUMBER() OVER (ORDER BY total_score DESC, user_id) AS rank
						FROM user_scores
						WHERE total_score > 0
					)
					SELECT
						r.user_id, r.fullname, r.image, r.gender, r.total_score, r.rank,
						NULL::int AS prev_rank
					FROM ranked r
					ORDER BY r.rank
				`;
			}

			const days = periodWindowDays[period];
			const currentStart = sql.raw(`NOW() - INTERVAL '${days} days'`);
			const prevStart = sql.raw(`NOW() - INTERVAL '${days * 2} days'`);

			return sql`
				WITH current_best AS (
					SELECT ${submissions.userId} AS user_id,
					       ${submissions.quizId} AS quiz_id,
					       MAX(${submissions.score}) AS max_score
					FROM ${submissions}
					WHERE ${submissions.createdAt} >= ${currentStart}
					GROUP BY ${submissions.userId}, ${submissions.quizId}
				),
				current_scores AS (
					SELECT user_id, COALESCE(SUM(max_score), 0) AS total_score
					FROM current_best
					GROUP BY user_id
				),
				prev_best AS (
					SELECT ${submissions.userId} AS user_id,
					       ${submissions.quizId} AS quiz_id,
					       MAX(${submissions.score}) AS max_score
					FROM ${submissions}
					WHERE ${submissions.createdAt} >= ${prevStart}
					  AND ${submissions.createdAt} < ${currentStart}
					GROUP BY ${submissions.userId}, ${submissions.quizId}
				),
				prev_scores AS (
					SELECT user_id, COALESCE(SUM(max_score), 0) AS total_score
					FROM prev_best
					GROUP BY user_id
				),
				current_ranked AS (
					SELECT
						u.id AS user_id,
						u.fullname,
						u.image,
						u.gender,
						COALESCE(c.total_score, 0) AS total_score,
						ROW_NUMBER() OVER (ORDER BY COALESCE(c.total_score, 0) DESC, u.id) AS rank
					FROM ${users} u
					LEFT JOIN current_scores c ON c.user_id = u.id
					WHERE COALESCE(c.total_score, 0) > 0
				),
				prev_ranked AS (
					SELECT
						user_id,
						ROW_NUMBER() OVER (ORDER BY total_score DESC, user_id) AS rank
					FROM prev_scores
					WHERE total_score > 0
				)
				SELECT
					cr.user_id, cr.fullname, cr.image, cr.gender, cr.total_score, cr.rank,
					pr.rank AS prev_rank
				FROM current_ranked cr
				LEFT JOIN prev_ranked pr ON pr.user_id = cr.user_id
				ORDER BY cr.rank
			`;
		};

		const rankedRowsResult = yield* dbTryPromise({
			try: () => db.execute(buildQuery()),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to fetch leaderboard",
				}),
		});

		const allRows = rankedRowsResult.rows as unknown as LeaderboardRow[];

		const pageRows = allRows.slice(offset, offset + limit + 1);
		const hasNextPage = pageRows.length > limit;
		const items = hasNextPage ? pageRows.slice(0, limit) : pageRows;
		const nextCursor = hasNextPage ? offset + limit : null;

		const userRow = allRows.find((r) => r.user_id === userId);

		const userBasicsResult = yield* dbTryPromise({
			try: () =>
				db
					.select({
						fullname: users.name,
						image: users.image,
						gender: users.gender,
					})
					.from(users)
					.where(eq(users.id, userId)),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to fetch user basics",
				}),
		});
		const userBasics = userBasicsResult[0] ?? null;

		const deltaOf = (row: LeaderboardRow): number | null => {
			if (period === "all") return null;
			if (row.prev_rank == null) return null;
			return Number(row.prev_rank) - Number(row.rank);
		};

		return {
			period,
			leaderboard: items.map((row) => ({
				rank: Number(row.rank),
				userId: row.user_id,
				fullname: row.fullname,
				image: row.image,
				gender: row.gender,
				totalScore: Number(row.total_score),
				rankDelta: deltaOf(row),
			})),
			currentUser: userRow
				? {
						rank: Number(userRow.rank),
						fullname: userRow.fullname,
						image: userRow.image,
						gender: userRow.gender,
						totalScore: Number(userRow.total_score),
						rankDelta: deltaOf(userRow),
					}
				: userBasics
					? {
							rank: 0,
							fullname: userBasics.fullname,
							image: userBasics.image,
							gender: userBasics.gender,
							totalScore: 0,
							rankDelta: null as number | null,
						}
					: null,
			pagination: {
				nextCursor,
				hasNextPage,
			},
		};
	});

export const fetchUserProfile = (userId: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const [userResult, allChaptersData, rawSubmissions] = yield* Effect.all([
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
				catch: (error) =>
					new DatabaseError({
						cause: error,
						message: "Failed to fetch chapters for stats",
					}),
			}),
			dbTryPromise({
				try: () =>
					db
						.select({
							chapterId: submissions.chapterId,
							quizId: submissions.quizId,
							score: submissions.score,
							createdAt: submissions.createdAt,
						})
						.from(submissions)
						.where(eq(submissions.userId, userId)),
				catch: (error) =>
					new DatabaseError({
						cause: error,
						message: "Failed to fetch user submissions",
					}),
			}),
		]);

		if (userResult.length === 0) {
			return yield* Effect.fail(
				new NotFoundError({ id: userId, entity: "User" }),
			);
		}

		const user = userResult[0];

		const bestScoreByQuiz = new Map<number, number>();
		const uniqueQuizIds = new Set<number>();
		const completedByChapter = new Map<number, Set<number>>();
		const uniqueDates = new Set<string>();

		for (const sub of rawSubmissions) {
			if (sub.quizId != null) {
				const current = bestScoreByQuiz.get(sub.quizId) ?? 0;
				bestScoreByQuiz.set(sub.quizId, Math.max(current, sub.score ?? 0));
				uniqueQuizIds.add(sub.quizId);
			}
			if (sub.chapterId != null && sub.quizId != null) {
				const set = completedByChapter.get(sub.chapterId) ?? new Set();
				set.add(sub.quizId);
				completedByChapter.set(sub.chapterId, set);
			}
			if (sub.createdAt) {
				uniqueDates.add(sub.createdAt.toISOString().split("T")[0]);
			}
		}

		const totalScore = [...bestScoreByQuiz.values()].reduce(
			(sum, s) => sum + s,
			0,
		);

		let chaptersCompleted = 0;
		for (const chapter of allChaptersData) {
			const quizCount = Number(chapter.quizCount);
			if (quizCount === 0) continue;
			const completed = completedByChapter.get(chapter.id);
			if (completed && completed.size >= quizCount) {
				chaptersCompleted++;
			}
		}

		const sortedDates = [...uniqueDates].sort().reverse();
		let dailyStreak = 0;
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		for (const dateStr of sortedDates) {
			const d = new Date(dateStr);
			d.setHours(0, 0, 0, 0);
			const expectedDate = new Date(today);
			expectedDate.setDate(expectedDate.getDate() - dailyStreak);
			if (d.getTime() === expectedDate.getTime()) {
				dailyStreak++;
			} else {
				break;
			}
		}

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
			stats: {
				total_score: totalScore,
				levels_completed: uniqueQuizIds.size,
				chapters_completed: chaptersCompleted,
				total_chapters: allChaptersData.length,
				daily_streak: dailyStreak,
			},
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

		const [updateResult, allChaptersData, rawSubmissions] = yield* Effect.all([
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
			}),
			dbTryPromise({
				try: () =>
					db
						.select({
							chapterId: submissions.chapterId,
							quizId: submissions.quizId,
							score: submissions.score,
							createdAt: submissions.createdAt,
						})
						.from(submissions)
						.where(eq(submissions.userId, userId)),
				catch: (error) =>
					new DatabaseError({
						cause: error,
						message: "Failed to fetch user submissions",
					}),
			}),
		]);

		if (updateResult.length === 0) {
			return yield* Effect.fail(
				new NotFoundError({ id: userId, entity: "User" }),
			);
		}

		const updatedUser = updateResult[0];

		// Fetch school name (need join, can't get from returning())
		const schoolRow = updatedUser.schoolId
			? yield* dbTryPromise({
					try: () =>
						db
							.select({ name: schools.name })
							.from(schools)
							.where(eq(schools.id, updatedUser.schoolId as number))
							.limit(1),
					catch: (error) =>
						new DatabaseError({
							cause: error,
							message: "Failed to fetch school",
						}),
				})
			: null;

		const bestScoreByQuiz = new Map<number, number>();
		const uniqueQuizIds = new Set<number>();
		const completedByChapter = new Map<number, Set<number>>();
		const uniqueDates = new Set<string>();

		for (const sub of rawSubmissions) {
			if (sub.quizId != null) {
				const current = bestScoreByQuiz.get(sub.quizId) ?? 0;
				bestScoreByQuiz.set(sub.quizId, Math.max(current, sub.score ?? 0));
				uniqueQuizIds.add(sub.quizId);
			}
			if (sub.chapterId != null && sub.quizId != null) {
				const set = completedByChapter.get(sub.chapterId) ?? new Set();
				set.add(sub.quizId);
				completedByChapter.set(sub.chapterId, set);
			}
			if (sub.createdAt) {
				uniqueDates.add(sub.createdAt.toISOString().split("T")[0]);
			}
		}

		const totalScore = [...bestScoreByQuiz.values()].reduce(
			(sum, s) => sum + s,
			0,
		);

		let chaptersCompleted = 0;
		for (const chapter of allChaptersData) {
			const quizCount = Number(chapter.quizCount);
			if (quizCount === 0) continue;
			const completed = completedByChapter.get(chapter.id);
			if (completed && completed.size >= quizCount) {
				chaptersCompleted++;
			}
		}

		const sortedDates = [...uniqueDates].sort().reverse();
		let dailyStreak = 0;
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		for (const dateStr of sortedDates) {
			const d = new Date(dateStr);
			d.setHours(0, 0, 0, 0);
			const expectedDate = new Date(today);
			expectedDate.setDate(expectedDate.getDate() - dailyStreak);
			if (d.getTime() === expectedDate.getTime()) {
				dailyStreak++;
			} else {
				break;
			}
		}

		return {
			id: updatedUser.id,
			fullname: updatedUser.name,
			email: updatedUser.email,
			image: updatedUser.image,
			bio: updatedUser.bio,
			gender: updatedUser.gender,
			grade: updatedUser.grade,
			school: schoolRow?.[0]
				? { id: updatedUser.schoolId ?? 0, name: schoolRow[0].name }
				: null,
			has_taken_pretest: updatedUser.hasTakenPretest,
			createdAt: updatedUser.createdAt,
			updatedAt: updatedUser.updatedAt,
			stats: {
				total_score: totalScore,
				levels_completed: uniqueQuizIds.size,
				chapters_completed: chaptersCompleted,
				total_chapters: allChaptersData.length,
				daily_streak: dailyStreak,
			},
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

		yield* deleteRefreshTokensBySession(result[0].token);

		return { success: true, id: sessionId };
	});

export const revokeAllUserSessions = (userId: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		yield* deleteRefreshTokensByUser(userId);

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
						question: {
							with: {
								chapter: true,
							},
						},
						answeredOption: true,
					},
				}),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to fetch user pretest submissions",
				}),
		});

		const bestScoreByQuiz = new Map<number, number>();
		for (const sub of userSubmissions) {
			if (sub.quizId != null) {
				const current = bestScoreByQuiz.get(sub.quizId) ?? 0;
				bestScoreByQuiz.set(sub.quizId, Math.max(current, sub.score ?? 0));
			}
		}
		const totalScore = [...bestScoreByQuiz.values()].reduce(
			(sum, s) => sum + s,
			0,
		);
		const levelsCompleted = new Set(userSubmissions.map((s) => s.quizId)).size;

		const allChaptersData = yield* dbTryPromise({
			try: () =>
				db
					.select({
						id: chapters.id,
						title: chapters.title,
						minimumScore: chapters.minimumScore,
						quizCount: sql<number>`count(${quizzes.id})`.as("quiz_count"),
					})
					.from(chapters)
					.leftJoin(quizzes, eq(chapters.id, quizzes.chapterId))
					.groupBy(chapters.id, chapters.title, chapters.minimumScore),
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
				chapterId: s.chapterId,
				chapterTitle: s.chapter?.title ?? "-",
				quizLevel: s.quiz?.level ?? 0,
				score: s.score ?? 0,
				createdAt: s.createdAt?.toISOString() ?? "",
			})),
			pretestSubmissions: userPretestSubmissions.map((p) => ({
				id: p.id,
				chapterId: p.question?.chapterId ?? null,
				chapterTitle: p.question?.chapter?.title ?? null,
				question: p.question?.question ?? "-",
				description: p.question?.description ?? "",
				answeredOption: p.answeredOption?.text ?? "-",
				isCorrect: p.isCorrect,
			})),
			chapters: allChaptersData.map((c) => ({
				id: c.id,
				title: c.title,
				minimumScore: c.minimumScore,
				quizCount: Number(c.quizCount),
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
				db.delete(userAchievements).where(eq(userAchievements.userId, userId)),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to delete achievements for user ${userId}`,
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

export const resetAllUsersProgress = () =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		yield* dbTryPromise({
			try: () => db.delete(submissions),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to delete submissions for all users",
				}),
		});

		yield* dbTryPromise({
			try: () => db.delete(userAchievements),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to delete achievements for all users",
				}),
		});

		return { success: true };
	});
