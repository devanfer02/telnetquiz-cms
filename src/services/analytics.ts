import { submissions, users } from "@/database/schema";
import { Db } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { Effect } from "effect";
import { DatabaseError } from "./errors/errors";

export const fetchAllUsers = Effect.gen(function* () {
	const { db } = yield* Db;

	return yield* Effect.tryPromise({
		try: () => db.select().from(users).orderBy(desc(users.createdAt)),
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
