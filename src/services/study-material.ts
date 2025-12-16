import { studyMaterials } from "@/database/schema";
import { Db } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { Effect } from "effect";
import { DatabaseError, NotFoundError } from "./errors/errors";

export const fetchAllStudyMaterials = Effect.gen(function* () {
	const { db } = yield* Db;

	return yield* Effect.tryPromise({
		try: () =>
			db.select().from(studyMaterials).orderBy(desc(studyMaterials.createdAt)),
		catch: (err) =>
			new DatabaseError({
				cause: err,
				message: "Failed to fetch study materials",
			}),
	});
});

export const fetchStudyMaterialById = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* Effect.tryPromise({
			try: () =>
				db.query.studyMaterials.findFirst({
					where: eq(studyMaterials.id, id),
				}),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to fetch study material with id ${id}`,
				}),
		});

		if (result === undefined) {
			return yield* Effect.fail(
				new NotFoundError({ id, entity: "StudyMaterial" }),
			);
		}

		return result;
	});
