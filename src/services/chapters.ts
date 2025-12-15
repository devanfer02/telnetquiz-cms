import { sql, eq } from "drizzle-orm";
import { chapters, questions, quizzes } from "@/database/schema";
import { Db } from "@/lib/db";
import { ChapterFormData } from "@/types/zod";
import { Effect } from "effect";
import { DatabaseError, NotFoundError } from "./errors/errors";

export const fetchAllChapters = Effect.gen(function* () {
	const { db } = yield* Db;

	return yield* Effect.tryPromise({
		try: () => db.select().from(chapters),
		catch: (err) =>
			new DatabaseError({
				cause: err,
				message: "Failed to fetch chapters",
			}),
	});
});

export const fetchChapterById = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* Effect.tryPromise({
			try: () =>
				db.query.chapters.findFirst({
					where: eq(chapters.id, id),
					with: {
						quizzes: {
							extras: {
								numberOfQuestions: sql<number>`(
                SELECT count(*)
                FROM ${questions}
                WHERE "questions"."quizId" = "chapters_quizzes"."id"
              )`.as("numberOfQuestions"),
							},
						},
					},
				}),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to fetch chapter with id ${id}`,
				}),
		});

		if (result === undefined) {
			return yield* Effect.fail(new NotFoundError({ id, entity: "Chapter" }));
		}

		return result;
	});

export const createChapter = (chapter: ChapterFormData) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* Effect.tryPromise({
			try: () => db.insert(chapters).values(chapter).returning(),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to create chapter",
				}),
		});

		return result[0];
	});

export const patchChapter = (id: number, chapter: ChapterFormData) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* Effect.tryPromise({
			try: () =>
				db.update(chapters).set(chapter).where(eq(chapters.id, id)).returning(),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to update chapter with id ${id}`,
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(new NotFoundError({ id, entity: "Chapter" }));
		}

		return result[0];
	});

export const deleteChapter = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		yield* Effect.tryPromise({
			try: () => db.delete(chapters).where(eq(chapters.id, id)),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to delete chapter with id ${id}`,
				}),
		});

		return { success: true, id };
	});
