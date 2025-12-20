import { questions } from "@/database/schema";
import { Db } from "@/lib/db";
import { desc } from "drizzle-orm";
import { Effect } from "effect";
import { DatabaseError } from "./errors/errors";

export const fetchAllQuestions = Effect.gen(function* () {
	const { db } = yield* Db;

	return yield* Effect.tryPromise({
		try: () => db.select().from(questions).orderBy(desc(questions.createdAt)),
		catch: (err) =>
			new DatabaseError({
				cause: err,
				message: "Failed to fetch questions",
			}),
	});
});
