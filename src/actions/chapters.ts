import { DbLayer } from "@/lib/db";
import {
	createChapter,
	deleteChapter,
	fetchAllChapters,
	fetchChapterById,
	patchChapter,
} from "@/services/chapters";
import { chapterSchema, idNumberSchema } from "@/types/zod";
import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";
import z from "zod";

export const getAllChapters = createServerFn({
	method: "GET",
}).handler(async () => {
	return Effect.runPromise(
		fetchAllChapters.pipe(
			Effect.provide(DbLayer),
			Effect.catchAll((err) => {
				console.error("Failed to get all chapters. ERR:", err);

				return Effect.succeed([]);
			}),
		),
	);
});

export const getChapterById = createServerFn({
	method: "GET",
})
	.inputValidator(z.number())
	.handler(async ({ data: id }) => {
		return Effect.runPromise(
			fetchChapterById(id).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to get chapter by id. ERR:", err);

					return Effect.succeed(null);
				}),
			),
		);
	});

export const addChapter = createServerFn({
	method: "POST",
})
	.inputValidator(chapterSchema)
	.handler(async ({ data }) => {
		return Effect.runPromise(
			createChapter(data).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to create new chapter. ERR:", err);

					return Effect.succeed(null);
				}),
			),
		);
	});

export const updateChapter = createServerFn({
	method: "POST",
})
	.inputValidator(
		idNumberSchema.extend(z.object({ chapter: chapterSchema }).shape),
	)
	.handler(async ({ data }) => {
		const { id, chapter } = data;

		return Effect.runPromise(
			patchChapter(id, chapter).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to update chapter. ERR:", err);

					return Effect.succeed(null);
				}),
			),
		);
	});

export const removeChapter = createServerFn({
	method: "POST",
})
	.inputValidator(idNumberSchema)
	.handler(async ({ data }) => {
		const { id } = data;

		return Effect.runPromise(
			deleteChapter(id).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to delete chapter. ERR:", err);

					return Effect.succeed(null);
				}),
			),
		);
	});
