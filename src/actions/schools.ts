import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";
import z from "zod";
import { DbLayer } from "@/lib/db";
import {
	createSchool,
	fetchAllSchools,
	fetchSchoolById,
	hideSchool,
	patchSchool,
	unhideSchool,
} from "@/services/users/schools";
import { idNumberSchema, schoolSchema } from "@/types/zod";

export const getAllSchools = createServerFn({
	method: "GET",
}).handler(async () => {
	return Effect.runPromise(
		fetchAllSchools.pipe(
			Effect.provide(DbLayer),
			Effect.catchAll((err) => {
				console.error("Failed to get all schools. ERR:", err);

				return Effect.succeed([]);
			}),
		),
	);
});

export const getSchoolById = createServerFn({
	method: "GET",
})
	.inputValidator(z.number())
	.handler(async ({ data: id }) => {
		return Effect.runPromise(
			fetchSchoolById(id).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to get school by id. ERR:", err);

					return Effect.succeed(null);
				}),
			),
		);
	});

export const addSchool = createServerFn({
	method: "POST",
})
	.inputValidator(schoolSchema)
	.handler(async ({ data }) => {
		return Effect.runPromise(
			createSchool(data).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to create new school. ERR:", err);

					return Effect.succeed(null);
				}),
			),
		);
	});

export const updateSchool = createServerFn({
	method: "POST",
})
	.inputValidator(
		idNumberSchema.extend(z.object({ school: schoolSchema }).shape),
	)
	.handler(async ({ data }) => {
		const { id, school } = data;

		return Effect.runPromise(
			patchSchool(id, school).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to update school. ERR:", err);

					return Effect.succeed(null);
				}),
			),
		);
	});

export const toggleSchoolVisibility = createServerFn({
	method: "POST",
})
	.inputValidator(idNumberSchema.extend({ isHidden: z.boolean() }))
	.handler(async ({ data }) => {
		const { id, isHidden } = data;
		const action = isHidden ? unhideSchool : hideSchool;

		return Effect.runPromise(
			action(id).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to toggle school visibility. ERR:", err);

					return Effect.succeed(null);
				}),
			),
		);
	});
