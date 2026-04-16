import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, parseBody, response } from "@/lib/http";
import { authRateLimiter } from "@/middlewares/rate-limit";
import type { AuthError, ValidationError } from "@/services/errors/errors";
import { rotateRefreshToken } from "@/services/users/refresh-tokens";
import { refreshTokenSchema } from "@/types/zod.api";

export const Route = createFileRoute("/api/(internal)/auth/refresh")({
	server: {
		handlers: {
			POST: {
				middleware: [authRateLimiter],
				handler: async ({ request }) =>
					Effect.runPromise(
						Effect.gen(function* () {
							const body = yield* Effect.tryPromise(() => request.json());
							const data = yield* parseBody(refreshTokenSchema, body);
							const result = yield* rotateRefreshToken(data.refreshToken);

							return response(
								{
									message: "Token refreshed successfully",
									token: result.sessionToken,
									refreshToken: result.refreshToken,
								},
								HttpStatus.OK,
							);
						}).pipe(
							Effect.provide(DbLayer),
							Effect.catchTags({
								ValidationError: (err: ValidationError) =>
									Effect.succeed(
										response(
											{
												message: "Validation failed",
												errors: err.errors,
											},
											HttpStatus.BAD_REQUEST,
										),
									),
								AuthError: (err: AuthError) =>
									Effect.succeed(
										response(
											{
												message: err.message,
											},
											HttpStatus.UNAUTHORIZED,
										),
									),
							}),
							Effect.catchAll(() =>
								Effect.succeed(
									response(
										{
											message: "Internal server error",
										},
										HttpStatus.INTERNAL_SERVER_ERROR,
									),
								),
							),
						),
					),
			},
		},
	},
});
