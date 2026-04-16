import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, parseBody, response } from "@/lib/http";
import { authRateLimiter } from "@/middlewares/rate-limit";
import type {
	AuthError,
	DatabaseError,
	ValidationError,
} from "@/services/errors/errors";
import { registerUser } from "@/services/users/auth";
import { registerUserSchema } from "@/types/zod.api";

export const Route = createFileRoute("/api/(internal)/auth/register")({
	server: {
		handlers: {
			POST: {
				middleware: [authRateLimiter],
				handler: async ({ request }) =>
					Effect.runPromise(
						Effect.gen(function* () {
							const body = yield* Effect.tryPromise(() => request.json());
							const data = yield* parseBody(registerUserSchema, body);

							const result = yield* registerUser(data);

							return response(
								{
									message: "Successfully register user",
									token: result.token,
									refreshToken: result.refreshToken,
								},
								HttpStatus.CREATED,
							);
						}).pipe(
							Effect.provide(DbLayer),
							Effect.catchTags({
								ValidationError: (err: ValidationError) =>
									Effect.succeed(
										response(
											{
												message: "Request body validation failed",
												errors: err.errors,
											},
											HttpStatus.BAD_REQUEST,
										),
									),
								AuthError: (err: AuthError) =>
									Effect.succeed(
										response(
											{
												message: "Failed to register user",
												errors: err.message,
											},
											HttpStatus.BAD_REQUEST,
										),
									),
								DatabaseError: (err: DatabaseError) =>
									Effect.succeed(
										response(
											{
												message: "Failed to register user",
												errors: err.message,
											},
											HttpStatus.INTERNAL_SERVER_ERROR,
										),
									),
							}),
							Effect.catchAll((err) => {
								return Effect.succeed(
									response(
										{
											message: "Internal server error",
										},
										HttpStatus.INTERNAL_SERVER_ERROR,
									),
								);
							}),
						),
					),
			},
		},
	},
});
