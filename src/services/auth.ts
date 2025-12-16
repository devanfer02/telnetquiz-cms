import { auth } from "@/lib/auth";
import { LoginUserFormData, RegisterUserFormData } from "@/types/zod.api";
import { Effect } from "effect";
import { AuthError } from "./errors/errors";

export const registerUser = (userForm: RegisterUserFormData) =>
	Effect.tryPromise({
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
