import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";
import z from "zod";
import { DbLayer } from "@/lib/db";
import {
	createAchievement,
	deleteAchievement,
	fetchAchievementById,
	fetchAchievementDetail,
	fetchAllAchievements,
	fetchUserAchievements,
	patchAchievement,
} from "@/services/achievements";
import { achievementSchema, idNumberSchema, idStringSchema } from "@/types/zod";

export const getAllAchievements = createServerFn({
	method: "GET",
}).handler(async () => {
	return Effect.runPromise(
		fetchAllAchievements.pipe(
			Effect.provide(DbLayer),
			Effect.catchAll((err) => {
				console.error("Failed to get all achievements. ERR:", err);
				return Effect.succeed([]);
			}),
		),
	);
});

export const getAchievementById = createServerFn({
	method: "GET",
})
	.inputValidator(z.number())
	.handler(async ({ data: id }) => {
		return Effect.runPromise(
			fetchAchievementById(id).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to get achievement by id. ERR:", err);
					return Effect.succeed(null);
				}),
			),
		);
	});

export const addAchievement = createServerFn({
	method: "POST",
})
	.inputValidator(achievementSchema)
	.handler(async ({ data }) => {
		const parsed = JSON.parse(data.rule);

		return Effect.runPromise(
			createAchievement({
				slug: data.slug,
				title: data.title,
				description: data.description,
				icon: data.icon || null,
				rule: parsed,
			}).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to create achievement. ERR:", err);
					return Effect.succeed(null);
				}),
			),
		);
	});

export const updateAchievement = createServerFn({
	method: "POST",
})
	.inputValidator(
		idNumberSchema.extend(z.object({ achievement: achievementSchema }).shape),
	)
	.handler(async ({ data }) => {
		const { id, achievement } = data;
		const parsed = JSON.parse(achievement.rule);

		return Effect.runPromise(
			patchAchievement(id, {
				slug: achievement.slug,
				title: achievement.title,
				description: achievement.description,
				icon: achievement.icon || null,
				rule: parsed,
				isActive: achievement.isActive,
			}).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to update achievement. ERR:", err);
					return Effect.succeed(null);
				}),
			),
		);
	});

export const removeAchievement = createServerFn({
	method: "POST",
})
	.inputValidator(idNumberSchema)
	.handler(async ({ data }) => {
		const { id } = data;

		return Effect.runPromise(
			deleteAchievement(id).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to delete achievement. ERR:", err);
					return Effect.succeed(null);
				}),
			),
		);
	});

export const getAchievementDetail = createServerFn({
	method: "GET",
})
	.inputValidator(z.number())
	.handler(async ({ data: id }) => {
		return Effect.runPromise(
			fetchAchievementDetail(id).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to get achievement detail. ERR:", err);
					return Effect.succeed(null);
				}),
			),
		);
	});

export const getUserAchievements = createServerFn({
	method: "GET",
})
	.inputValidator(idStringSchema)
	.handler(async ({ data }) => {
		const { id } = data;

		return Effect.runPromise(
			fetchUserAchievements(id).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to get user achievements. ERR:", err);
					return Effect.succeed([]);
				}),
			),
		);
	});
