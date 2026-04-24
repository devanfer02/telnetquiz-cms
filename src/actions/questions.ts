import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";
import z from "zod";
import { DbLayer } from "@/lib/db";
import { S3Layer } from "@/lib/s3";
import {
	createQuestions,
	deleteQuestionById,
	fetchAllQuestions,
	fetchQuestionById,
	patchQuestion,
} from "@/services/content/questions";

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

export const getQuestionById = createServerFn({
	method: "GET",
})
	.inputValidator(z.number())
	.handler(async ({ data: id }) => {
		return Effect.runPromise(
			fetchQuestionById(id).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to fetch question. ERR:", err);
					return Effect.fail(null);
				}),
			),
		);
	});

const parseIntOrNull = (value: FormDataEntryValue | null): number | null => {
	if (value === null) return null;
	const n = Number(value);
	return Number.isFinite(n) && n > 0 ? n : null;
};

export const addQuestions = createServerFn({
	method: "POST",
})
	.inputValidator(z.instanceof(FormData))
	.handler(async ({ data }) => {
		const type = data.get("type") as "pretest" | "quiz";
		const quizId = parseIntOrNull(data.get("quizId"));
		const materialId = parseIntOrNull(data.get("materialId"));
		const questionsRaw = JSON.parse(data.get("questions") as string);

		const questions = questionsRaw.map(
			(q: Record<string, unknown>, index: number) => {
				const image = data.get(`image_${index}`);
				return {
					...q,
					image: image instanceof File ? image : undefined,
				};
			},
		);

		const parsedData = {
			type,
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
					return Effect.succeed(null);
				}),
			),
		);
	});

export const updateQuestion = createServerFn({
	method: "POST",
})
	.inputValidator(z.instanceof(FormData))
	.handler(async ({ data }) => {
		const id = Number(data.get("id"));
		const type = data.get("type") as "pretest" | "quiz";
		const quizId = parseIntOrNull(data.get("quizId"));
		const materialId = parseIntOrNull(data.get("materialId"));
		const description = data.get("description") as string;
		const question = data.get("question") as string;
		const optionsRaw = JSON.parse(data.get("options") as string);
		const image = data.get("image");

		const parsedData = {
			type,
			quizId,
			materialId,
			description,
			question,
			options: optionsRaw,
			image: image instanceof File ? image : undefined,
		};

		return Effect.runPromise(
			patchQuestion(id, parsedData).pipe(
				Effect.provide(DbLayer),
				Effect.provide(S3Layer),
				Effect.catchAll((err) => {
					console.error("Failed to update question. ERR:", err);
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
					console.error("Failed to delete question. ERR:", err);

					return Effect.succeed(null);
				}),
			),
		);
	});
