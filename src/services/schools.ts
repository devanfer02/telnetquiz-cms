import { asc } from "drizzle-orm";
import { Effect } from "effect";
import { schools } from "@/database/schema";
import { Db } from "@/lib/db";
import { dbTryPromise } from "@/lib/retry";
import { DatabaseError } from "./errors/errors";

export const fetchAllSchools = Effect.gen(function* () {
	const { db } = yield* Db;

	return yield* dbTryPromise({
		try: () => db.select().from(schools).orderBy(asc(schools.name)),
		catch: (err) =>
			new DatabaseError({
				cause: err,
				message: "Failed to fetch schools",
			}),
	});
});
