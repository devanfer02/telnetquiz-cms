import { DbLayer } from "@/lib/db";
import { S3Layer } from "@/lib/s3";
import {
	createStudyMaterial,
	deleteStudyMaterialById,
	fetchAllStudyMaterials,
	fetchStudyMaterialById,
	patchStudyMaterial,
} from "@/services/study-material";
import { studyMaterialSchema } from "@/types/zod";
import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";
import z from "zod";

export const getAllStudyMaterials = createServerFn({
	method: "GET",
}).handler(async () => {
	return Effect.runPromise(
		fetchAllStudyMaterials.pipe(
			Effect.provide(DbLayer),
			Effect.catchAll((err) => {
				console.error("Failed to get all study materials. ERR:", err);

				return Effect.succeed([]);
			}),
		),
	);
});

export const getStudyMaterialById = createServerFn({
	method: "GET",
})
	.inputValidator(z.number())
	.handler(async ({ data: id }) => {
		return Effect.runPromise(
			fetchStudyMaterialById(id).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to get study material by id. ERR:", err);

					return Effect.succeed(null);
				}),
			),
		);
	});

export const addStudyMaterial = createServerFn({
	method: "POST",
})
	.inputValidator(studyMaterialSchema)
	.handler(async ({ data }) => {
		return Effect.runPromise(
			createStudyMaterial(data).pipe(
				Effect.provide(DbLayer),
				Effect.provide(S3Layer),
				Effect.catchAll((err) => {
					console.error("Failed to add new study material. ERR:", err);

					return Effect.succeed(null);
				}),
			),
		);
	});

export const updateStudyMaterial = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			id: z.number(),
			studyMaterial: studyMaterialSchema,
		}),
	)
	.handler(async ({ data }) => {
		const { id, studyMaterial } = data;
		return Effect.runPromise(
			patchStudyMaterial(id, studyMaterial).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to update study material. ERR:", err);

					return Effect.succeed(null);
				}),
			),
		);
	});

export const deleteStudyMaterial = createServerFn({
	method: "POST",
})
	.inputValidator(z.number())
	.handler(async ({ data: id }) => {
		return Effect.runPromise(
			deleteStudyMaterialById(id).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to delete study material. ERR:", err);

					return Effect.succeed(null);
				}),
			),
		);
	});
