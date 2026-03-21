import { getRequestHeaders } from "@tanstack/react-start/server";
import { and, desc, eq, sql } from "drizzle-orm";
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

		// Get leaderboard with total scores
		const leaderboardQuery = db
			.select({
				userId: users.id,
				fullname: users.name,
				image: users.image,
				totalScore: sql<number>`COALESCE(SUM(${submissions.score}), 0)`.as(
					"total_score",
				),
			})
			.from(users)
			.leftJoin(submissions, eq(users.id, submissions.userId))
			.groupBy(users.id, users.name, users.image)
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

		// Check if there's a next page
		const hasNextPage = leaderboard.length > limit;
		const items = hasNextPage ? leaderboard.slice(0, limit) : leaderboard;
		const nextCursor = hasNextPage ? (cursor ?? 0) + limit : null;

		// Get current user's rank and score in parallel
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
							totalScore: sql<number>`COALESCE(SUM(${submissions.score}), 0)`.as(
								"total_score",
							),
						})
						.from(users)
						.leftJoin(submissions, eq(users.id, submissions.userId))
						.where(eq(users.id, userId))
						.groupBy(users.id, users.name, users.image),
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
				totalScore: Number(item.totalScore),
			})),
			currentUser: currentUser
				? {
						rank: Number(userRank),
						fullname: currentUser.fullname,
						image: currentUser.image,
						totalScore: Number(currentUser.totalScore),
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

		// All 3 queries in parallel — user, submissions, chapters
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

		// Derive all stats from single submissions query
		let totalScore = 0;
		const uniqueQuizIds = new Set<number>();
		const completedByChapter = new Map<number, Set<number>>();
		const uniqueDates = new Set<string>();

		for (const sub of rawSubmissions) {
			totalScore += sub.score ?? 0;
			if (sub.quizId != null) uniqueQuizIds.add(sub.quizId);
			if (sub.chapterId != null && sub.quizId != null) {
				const set = completedByChapter.get(sub.chapterId) ?? new Set();
				set.add(sub.quizId);
				completedByChapter.set(sub.chapterId, set);
			}
			if (sub.createdAt) {
				uniqueDates.add(sub.createdAt.toISOString().split("T")[0]);
			}
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

		// Compute daily streak from sorted unique dates
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
			// Nothing to update, just return current profile
			return yield* fetchUserProfile(userId);
		}

		const result = yield* dbTryPromise({
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
		});

		if (result.length === 0) {
			return yield* Effect.fail(
				new NotFoundError({ id: userId, entity: "User" }),
			);
		}

		return yield* fetchUserProfile(userId);
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

		// Fetch quiz submissions with chapter and quiz info
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

		// Fetch pretest submissions
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

		// Compute stats
		const totalScore = userSubmissions.reduce(
			(sum, s) => sum + (s.score ?? 0),
			0,
		);
		const levelsCompleted = new Set(userSubmissions.map((s) => s.quizId)).size;

		// Chapters completed: chapters where user has completed ALL quizzes
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

		return { success: true, userId };
	});

export const fetchUserAchievements = (userId: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		type Achievement = {
			id: string;
			title: string;
			description: string;
			unlocked: boolean;
			unlockedAt: string | null;
		};

		const achievements: Achievement[] = [];

		// Run first 3 achievement checks in parallel
		const [pretestEntry, firstSubmission, perfectScore] = yield* Effect.all([
			dbTryPromise({
				try: () =>
					db.query.pretestSubmissions.findFirst({
						where: eq(pretestSubmissions.userId, userId),
						columns: { createdAt: true },
					}),
				catch: (err) =>
					new DatabaseError({
						cause: err,
						message: "Failed to check pretest submissions",
					}),
			}),
			dbTryPromise({
				try: () =>
					db.query.submissions.findFirst({
						where: eq(submissions.userId, userId),
						orderBy: submissions.createdAt,
						columns: { createdAt: true },
					}),
				catch: (err) =>
					new DatabaseError({
						cause: err,
						message: "Failed to check quiz submissions",
					}),
			}),
			dbTryPromise({
				try: () =>
					db.query.submissions.findFirst({
						where: and(
							eq(submissions.userId, userId),
							eq(submissions.score, 100),
						),
						columns: { createdAt: true },
					}),
				catch: (err) =>
					new DatabaseError({
						cause: err,
						message: "Failed to check perfect scores",
					}),
			}),
		]);

		achievements.push({
			id: "pretest_complete",
			title: "Penjelajah Pretest",
			description: "Menyelesaikan pretest",
			unlocked: pretestEntry !== undefined,
			unlockedAt: pretestEntry?.createdAt?.toISOString() ?? null,
		});

		achievements.push({
			id: "first_quiz",
			title: "Kuis Pertama",
			description: "Menyelesaikan kuis pertama",
			unlocked: firstSubmission !== undefined,
			unlockedAt: firstSubmission?.createdAt?.toISOString() ?? null,
		});

		achievements.push({
			id: "perfect_score",
			title: "Nilai Sempurna",
			description: "Mendapatkan nilai 100 pada kuis",
			unlocked: perfectScore !== undefined,
			unlockedAt: perfectScore?.createdAt?.toISOString() ?? null,
		});

		// Run chapter mastery queries in parallel
		const [allChapters, userSubmissions] = yield* Effect.all([
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
						message: "Failed to fetch chapters with quiz counts",
					}),
			}),
			dbTryPromise({
				try: () =>
					db
						.select({
							chapterId: submissions.chapterId,
							quizId: submissions.quizId,
							createdAt: submissions.createdAt,
						})
						.from(submissions)
						.where(eq(submissions.userId, userId)),
				catch: (err) =>
					new DatabaseError({
						cause: err,
						message: "Failed to fetch user submissions for chapter mastery",
					}),
			}),
		]);

		// Group user's completed quizzes by chapter
		const completedQuizzesByChapter = new Map<
			number,
			{ quizIds: Set<number>; latestDate: Date }
		>();
		for (const sub of userSubmissions) {
			if (sub.chapterId == null || sub.quizId == null) continue;
			const entry = completedQuizzesByChapter.get(sub.chapterId);
			if (entry) {
				entry.quizIds.add(sub.quizId);
				if (sub.createdAt && sub.createdAt > entry.latestDate) {
					entry.latestDate = sub.createdAt;
				}
			} else {
				completedQuizzesByChapter.set(sub.chapterId, {
					quizIds: new Set([sub.quizId]),
					latestDate: sub.createdAt ?? new Date(),
				});
			}
		}

		let chapterMasteryUnlocked = false;
		let chapterMasteryDate: string | null = null;

		for (const chapter of allChapters) {
			const quizCount = Number(chapter.quizCount);
			if (quizCount === 0) continue;
			const completed = completedQuizzesByChapter.get(chapter.id);
			if (completed && completed.quizIds.size >= quizCount) {
				chapterMasteryUnlocked = true;
				chapterMasteryDate = completed.latestDate.toISOString();
				break;
			}
		}

		achievements.push({
			id: "chapter_master",
			title: "Penguasa Bab",
			description: "Menyelesaikan semua kuis dalam satu bab",
			unlocked: chapterMasteryUnlocked,
			unlockedAt: chapterMasteryDate,
		});

		return { achievements };
	});
