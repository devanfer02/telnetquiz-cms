import {
	submissions,
	users,
	chapters,
	quizzes,
	studyMaterials,
	questions,
	accounts,
} from "@/database/schema";
import { Db } from "@/lib/db";
import { desc, eq, ne, sql } from "drizzle-orm";
import { Effect } from "effect";
import { DatabaseError } from "./errors/errors";

export const fetchAllUsers = Effect.gen(function* () {
	const { db } = yield* Db;

	return yield* Effect.tryPromise({
		try: () =>
			db
				.select()
				.from(users)
				.innerJoin(accounts, eq(accounts.userId, users.id))
				.orderBy(desc(users.createdAt))
				.where(ne(accounts.providerId, "google")),
		catch: (err) =>
			new DatabaseError({
				cause: err,
				message: "Failed to fetch users",
			}),
	});
});

export const fetchAllSubmissions = Effect.gen(function* () {
	const { db } = yield* Db;

	const results = yield* Effect.tryPromise({
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

	// Transform data to match the expected Submission type in frontend
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

	const results = yield* Effect.tryPromise({
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

	const results = yield* Effect.tryPromise({
		try: () =>
			db
				.select({
					userName: users.name,
					score: sql<number>`SUM(${submissions.score})`,
					latestSubmitAt: sql<string>`MAX(${submissions.createdAt})`,
				})
				.from(submissions)
				.leftJoin(users, eq(submissions.userId, users.id))
				.groupBy(users.name)
				.orderBy(desc(sql`SUM(${submissions.score})`))
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

	const stats = yield* Effect.tryPromise({
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
