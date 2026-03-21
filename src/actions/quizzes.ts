import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";
import z from "zod";
import { DbLayer } from "@/lib/db";
import {
	createQuiz,
	deleteQuiz,
	fetchAllQuizzes,
	fetchQuizById,
	patchQuiz,
} from "@/services/quizzes";
import { idNumberSchema, quizSchema } from "@/types/zod";

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

export const updateQuiz = createServerFn({
	method: "POST",
})
	.inputValidator(idNumberSchema.extend(z.object({ quiz: quizSchema }).shape))
	.handler(async ({ data }) => {
		const { id, quiz } = data;

		return Effect.runPromise(
			patchQuiz(id, quiz).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to update chapter. ERR: ", err);

					return Effect.succeed(null);
				}),
			),
		);
	});

export const removeQuiz = createServerFn({
	method: "POST",
})
	.inputValidator(idNumberSchema)
	.handler(async ({ data }) => {
		const { id } = data;

		return Effect.runPromise(
			deleteQuiz(id).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to delete quiz. ERR:", err);

					return Effect.succeed(null);
				}),
			),
		);
	});
