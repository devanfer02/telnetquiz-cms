import { DbLayer } from "@/lib/db";
import { fetchAllQuizzes, fetchQuizById } from "@/services/quizzes";
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
