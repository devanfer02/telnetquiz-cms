import { DbLayer } from "@/lib/db";
import { S3Layer } from "@/lib/s3";
import {
	createQuestions,
	deleteQuestionById,
	fetchAllQuestions,
} from "@/services/questions";
import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";
import z from "zod";

export const getAllQuestions = createServerFn({
	method: "GET",
}).handler(async () => {
	return Effect.runPromise(
		fetchAllQuestions.pipe(
			Effect.provide(DbLayer),
			Effect.catchAll((err) => {
				console.error("Failed to get all questions. ERR:", err);

				return Effect.succeed([]);
			}),
		),
	);
});

export const addQuestions = createServerFn({
	method: "POST",
})
	.inputValidator(z.instanceof(FormData))
	.handler(async ({ data }) => {
		const quizId = Number(data.get("quizId"));
		const materialId = Number(data.get("materialId"));
		const questionsRaw = JSON.parse(data.get("questions") as string);

		const questions = questionsRaw.map((q: any, index: number) => {
			const image = data.get(`image_${index}`);
			return {
				...q,
				image: image instanceof File ? image : undefined,
			};
		});

		const parsedData = {
			quizId,
			materialId,
			questions,
		};

		return Effect.runPromise(
			createQuestions(parsedData).pipe(
				Effect.provide(DbLayer),
				Effect.provide(S3Layer),
				Effect.catchAll((err) => {
					console.error("Failed to create questions. ERR:", err);
					return Effect.fail(err);
				}),
			),
		);
	});

export const removeQuestion = createServerFn({
	method: "POST",
})
	.inputValidator(z.number())
	.handler(async ({ data: id }) => {
		return Effect.runPromise(
			deleteQuestionById(id).pipe(
				Effect.provide(DbLayer),
				Effect.provide(S3Layer),
				Effect.catchAll((err) => {
					console.error("Failed to delete study material. ERR:", err);

					return Effect.fail(null);
				}),
			),
		);
	});
