import { DbLayer } from "@/lib/db";
import {
	fetchAllStudyMaterials,
	fetchStudyMaterialById,
} from "@/services/study-material";
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
