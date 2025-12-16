import { auth } from "@/lib/auth";
import { RegisterUserFormData } from "@/types/zod.api";
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
