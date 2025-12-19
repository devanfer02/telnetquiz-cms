import { DbLayer } from "@/lib/db";
import { R2Layer } from "@/lib/storage";
import {
	createStudyMaterial,
	fetchAllStudyMaterials,
	fetchStudyMaterialById,
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
				Effect.provide(R2Layer),
				Effect.catchAll((err) => {
					console.error("Failed to add new study material. ERR:", err);

					return Effect.succeed(null);
				}),
			),
		);
	});
