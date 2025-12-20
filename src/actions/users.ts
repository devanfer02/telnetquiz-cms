import { AuthLayer } from "@/lib/auth";
import { DbLayer } from "@/lib/db";
import { deleteUser, patchUser } from "@/services/users";
import { idStringSchema, editUserSchema } from "@/types/zod";
import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";
import z from "zod";

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
