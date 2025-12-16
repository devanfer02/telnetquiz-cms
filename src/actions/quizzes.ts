import { DbLayer } from "@/lib/db";
import { createQuiz, fetchAllQuizzes, fetchQuizById } from "@/services/quizzes";
import { quizSchema } from "@/types/zod";
import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";
import z from "zod";

export const getAllQuizzes = createServerFn({
	method: "GET",
}).handler(async () => {
	return Effect.runPromise(
		fetchAllQuizzes.pipe(
			Effect.provide(DbLayer),
			Effect.catchAll((err) => {
				console.error("Failed to get all quizzes. ERR:", err);

				return Effect.succeed([]);
			}),
		),
	);
});

export const getQuizById = createServerFn({
	method: "GET",
})
	.inputValidator(z.number())
	.handler(async ({ data: id }) => {
		return Effect.runPromise(
			fetchQuizById(id).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to get quiz by id. ERR:", err);

					return Effect.succeed(null);
				}),
			),
		);
	});

export const addQuiz = createServerFn({
	method: "POST",
})
	.inputValidator(quizSchema)
	.handler(async ({ data }) => {
		return Effect.runPromise(
			createQuiz(data).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to create new chapter. ERR:", err);

					return Effect.succeed(null);
				}),
			),
		);
	});
