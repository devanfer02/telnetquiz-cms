import { questions, quizzes } from "@/database/schema";
import { Db } from "@/lib/db";
import { desc, eq, sql } from "drizzle-orm";
import { Effect } from "effect";
import { DatabaseError, NotFoundError } from "./errors/errors";
import { QuizFormData } from "@/types/zod";

export const fetchAllQuizzes = Effect.gen(function* () {
	const { db } = yield* Db;

	return yield* Effect.tryPromise({
		try: () =>
			db.query.quizzes.findMany({
				orderBy: desc(quizzes.createdAt),
				with: {
					chapter: true,
				},
				extras: {
					numberOfQuestions: sql<number>`(
          SELECT count(*)
          FROM ${questions}
          WHERE "questions"."quizId" = "quizzes"."id"
        )`.as("numberOfQuestions"),
				},
			}),
		catch: (err) =>
			new DatabaseError({
				cause: err,
				message: "Failed to fetch quizzes",
			}),
	});
});

export const fetchQuizById = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* Effect.tryPromise({
			try: () =>
				db.query.quizzes.findFirst({
					where: eq(quizzes.id, id),
					with: {
						questions: true,
					},
					extras: {
						numberOfQuestions: sql<number>`(
            SELECT count(*)
            FROM ${questions}
            WHERE "questions"."quizId" = "quizzes"."id"
          )`.as("numberOfQuestions"),
					},
				}),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to fetch quiz with id ${id}`,
				}),
		});

		if (result === undefined) {
			return yield* Effect.fail(new NotFoundError({ id, entity: "Quiz" }));
		}

		return result;
	});

export const createQuiz = (quiz: QuizFormData) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* Effect.tryPromise({
			try: () => db.insert(quizzes).values(quiz).returning(),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: "Failed to create chapter",
				}),
		});

		return result[0];
	});

export const patchQuiz = (id: number, quiz: QuizFormData) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* Effect.tryPromise({
			try: () =>
				db.update(quizzes).set(quiz).where(eq(quizzes.id, id)).returning(),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to update quiz with id ${id}`,
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(new NotFoundError({ id, entity: "Quiz" }));
		}

		return result[0];
	});

export const deleteQuiz = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		yield* Effect.tryPromise({
			try: () => db.delete(quizzes).where(eq(quizzes.id, id)),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to delete quiz with id ${id}`,
				}),
		});

		return { success: true, id };
	});
