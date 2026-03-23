import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { users } from "@/database/schema";
import { auth } from "@/lib/auth/server";
import { Db } from "@/lib/db";
import { dbTryPromise } from "@/lib/retry";
import type { LoginUserFormData, RegisterUserFormData } from "@/types/zod.api";
import { AuthError, DatabaseError } from "./errors/errors";

export const registerUser = (userForm: RegisterUserFormData) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* Effect.tryPromise({
			try: () =>
				auth.api.signUpEmail({
					body: {
						email: userForm.email,
						name: userForm.fullname,
						password: userForm.password,
					},
				}),
			catch: (err) =>
				new AuthError({
					message: (err as Error).message,
				}),
		});

		if (result.user?.id) {
			yield* dbTryPromise({
				try: () =>
					db
						.update(users)
						.set({
							schoolId: userForm.school_id,
							gender: userForm.gender,
							grade: userForm.grade,
						})
						.where(eq(users.id, result.user.id)),
				catch: (err) =>
					new DatabaseError({
						cause: err,
						message: "Failed to update user profile fields",
					}),
			});
		}

		return result;
	});

export const loginUser = (userForm: LoginUserFormData) =>
	Effect.tryPromise({
		try: () =>
			auth.api.signInEmail({
				body: {
					email: userForm.email,
					password: userForm.password,
				},
			}),
		catch: (err) =>
			new AuthError({
				message: (err as Error).message,
			}),
	});
