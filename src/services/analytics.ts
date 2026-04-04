import { and, desc, eq, exists, ne, sql } from "drizzle-orm";
import { Effect } from "effect";
import {
	accounts,
	chapters,
	questions,
	quizzes,
	schools,
	studyMaterials,
	submissions,
	users,
} from "@/database/schema";
import { Db } from "@/lib/db";
import { dbTryPromise } from "@/lib/retry";
import { DatabaseError } from "./errors/errors";

export const fetchAllUsers = Effect.gen(function* () {
	const { db } = yield* Db;

	return yield* dbTryPromise({
		try: () =>
			db
				.select({
					id: users.id,
					name: users.name,
					email: users.email,
					image: users.image,
					schoolId: users.schoolId,
					schoolName: schools.name,
					gender: users.gender,
					grade: users.grade,
					bio: users.bio,
					createdAt: users.createdAt,
				})
				.from(users)
				.leftJoin(schools, eq(users.schoolId, schools.id))
				.where(
					exists(
						db
							.select({ one: sql`1` })
							.from(accounts)
							.where(
								and(
									eq(accounts.userId, users.id),
									ne(accounts.providerId, "google"),
								),
							),
					),
				)
				.orderBy(desc(users.createdAt)),
		catch: (err) =>
			new DatabaseError({
				cause: err,
				message: "Failed to fetch users",
			}),
	});
});

export const fetchAllSubmissions = Effect.gen(function* () {
	const { db } = yield* Db;

	const results = yield* dbTryPromise({
		try: () =>
			db.query.submissions.findMany({
				orderBy: desc(submissions.createdAt),
				with: {
					user: true,
					quiz: true,
					chapter: true,
				},
			}),
		catch: (err) =>
			new DatabaseError({
				cause: err,
				message: "Failed to fetch submissions",
			}),
	});

	return results.map((sub) => ({
		id: sub.id,
		userName: sub.user?.name || "Unknown User",
		chapterId: sub.chapterId?.toString() || "-",
		quizId: sub.quizId?.toString() || "-",
		score: sub.score || 0,
		startedAt: sub.createdAt?.toISOString() || "",
		completedAt: sub.createdAt?.toISOString() || "", // Assuming createdAt is completion time for now
	}));
});

export const fetchAverageScores = Effect.gen(function* () {
	const { db } = yield* Db;

	const results = yield* dbTryPromise({
		try: () =>
			db
				.select({
					chapter: chapters.title,
					averageScore: sql<number>`CAST(AVG(${submissions.score}) AS INTEGER)`,
				})
				.from(submissions)
				.leftJoin(chapters, eq(submissions.chapterId, chapters.id))
				.groupBy(chapters.title),
		catch: (err) =>
			new DatabaseError({
				cause: err,
				message: "Failed to fetch average scores",
			}),
	});

	return results;
});

export const fetchLeaderboard = Effect.gen(function* () {
	const { db } = yield* Db;

	const bestPerQuiz = db
		.select({
			userId: submissions.userId,
			bestScore: sql<number>`MAX(${submissions.score})`.as("best_score"),
			latestAt: sql<string>`MAX(${submissions.createdAt})`.as("latest_at"),
		})
		.from(submissions)
		.groupBy(submissions.userId, submissions.quizId)
		.as("best_per_quiz");

	const results = yield* dbTryPromise({
		try: () =>
			db
				.select({
					userName: users.name,
					score: sql<number>`SUM(${bestPerQuiz.bestScore})`,
					latestSubmitAt: sql<string>`MAX(${bestPerQuiz.latestAt})`,
				})
				.from(bestPerQuiz)
				.leftJoin(users, eq(bestPerQuiz.userId, users.id))
				.groupBy(users.name)
				.orderBy(desc(sql`SUM(${bestPerQuiz.bestScore})`))
				.limit(10),
		catch: (err) =>
			new DatabaseError({
				cause: err,
				message: "Failed to fetch leaderboard",
			}),
	});

	return results.map((entry, index) => ({
		rank: index + 1,
		userName: entry.userName || "Unknown User",
		score: Number(entry.score),
		latestSubmitAt: new Date(entry.latestSubmitAt).toISOString(),
	}));
});

export const fetchDashboardStats = Effect.gen(function* () {
	const { db } = yield* Db;

	const stats = yield* dbTryPromise({
		try: () =>
			Promise.all([
				db.select({ count: sql<number>`count(*)` }).from(chapters),
				db.select({ count: sql<number>`count(*)` }).from(quizzes),
				db.select({ count: sql<number>`count(*)` }).from(studyMaterials),
				db.select({ count: sql<number>`count(*)` }).from(questions),
				db.select({ count: sql<number>`count(*)` }).from(submissions),
				db.select({ count: sql<number>`count(*)` }).from(users),
			]),
		catch: (err) =>
			new DatabaseError({
				cause: err,
				message: "Failed to fetch dashboard stats",
			}),
	});

	return {
		chapters: Number(stats[0][0].count),
		quizzes: Number(stats[1][0].count),
		studyMaterials: Number(stats[2][0].count),
		questions: Number(stats[3][0].count),
		submissions: Number(stats[4][0].count),
		users: Number(stats[5][0].count),
	};
});
