import { eq } from "drizzle-orm";
import { users } from "@/database/schema";
import { Db } from "@/lib/db";
import { EditUserFormData } from "@/types/zod";
import { Effect } from "effect";
import { AuthError, DatabaseError, NotFoundError } from "./errors/errors";
import { Auth } from "@/lib/auth";

export const patchUser = (id: string, user: EditUserFormData) =>
	Effect.gen(function* () {
		const { db } = yield* Db;
		const { auth } = yield* Auth;

		const result = yield* Effect.tryPromise({
			try: () =>
				db
					.update(users)
					.set({
						name: user.fullname,
						email: user.email,
					})
					.where(eq(users.id, id))
					.returning(),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to update user with id ${id}`,
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(new NotFoundError({ id, entity: "User" }));
		}

		const password = user.password;

		if (password) {
			yield* Effect.tryPromise({
				try: () =>
					auth.api.setUserPassword({
						body: {
							newPassword: password,
							userId: result[0].id,
						},
					}),
				catch: (err) => {
					new AuthError({
						message: (err as Error).message,
					});
				},
			});
		}

		return result[0];
	});

export const deleteUser = (id: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		yield* Effect.tryPromise({
			try: () => db.delete(users).where(eq(users.id, id)),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to delete user with id ${id}`,
				}),
		});

		return { success: true, id };
	});
