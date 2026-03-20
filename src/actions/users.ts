import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";
import z from "zod";
import { AuthLayer } from "@/lib/auth";
import { DbLayer } from "@/lib/db";
import {
	deleteUser,
	fetchUserSessions,
	patchUser,
	resetUserProgress,
	revokeAllUserSessions,
	revokeSession,
} from "@/services/users";
import { editUserSchema, idStringSchema } from "@/types/zod";

export const updateUser = createServerFn({
	method: "POST",
})
	.inputValidator(
		idStringSchema.extend(z.object({ user: editUserSchema }).shape),
	)
	.handler(async ({ data }) => {
		const { id, user } = data;

		return Effect.runPromise(
			patchUser(id, user).pipe(
				Effect.provide(DbLayer),
				Effect.provide(AuthLayer),
				Effect.catchAll((err) => {
					console.error("Failed to update user. ERR:", err);

					return Effect.succeed(null);
				}),
			),
		);
	});

export const removeUser = createServerFn({
	method: "POST",
})
	.inputValidator(idStringSchema)
	.handler(async ({ data }) => {
		const { id } = data;

		return Effect.runPromise(
			deleteUser(id).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to delete user. ERR:", err);

					return Effect.succeed(null);
				}),
			),
		);
	});

export const getUserSessions = createServerFn({
	method: "GET",
})
	.inputValidator(idStringSchema)
	.handler(async ({ data }) => {
		const { id } = data;

		return Effect.runPromise(
			fetchUserSessions(id).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to fetch user sessions. ERR:", err);

					return Effect.succeed([]);
				}),
			),
		);
	});

export const deleteSession = createServerFn({
	method: "POST",
})
	.inputValidator(idStringSchema)
	.handler(async ({ data }) => {
		const { id } = data;

		return Effect.runPromise(
			revokeSession(id).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to revoke session. ERR:", err);

					return Effect.succeed(null);
				}),
			),
		);
	});

export const deleteAllUserSessions = createServerFn({
	method: "POST",
})
	.inputValidator(idStringSchema)
	.handler(async ({ data }) => {
		const { id } = data;

		return Effect.runPromise(
			revokeAllUserSessions(id).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to revoke all user sessions. ERR:", err);

					return Effect.succeed(null);
				}),
			),
		);
	});

export const resetUserProgressAction = createServerFn({
	method: "POST",
})
	.inputValidator(idStringSchema)
	.handler(async ({ data }) => {
		const { id } = data;

		return Effect.runPromise(
			resetUserProgress(id).pipe(
				Effect.provide(DbLayer),
				Effect.catchAll((err) => {
					console.error("Failed to reset user progress. ERR:", err);

					return Effect.succeed(null);
				}),
			),
		);
	});
