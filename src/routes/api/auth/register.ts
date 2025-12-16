import { HttpStatus, response } from "@/lib/http";
import { parseBody } from "@/lib/http";
import { registerUser } from "@/services/auth";
import { AuthError, ValidationError } from "@/services/errors/errors";
import { registerUserSchema } from "@/types/zod.api";
import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";

export const Route = createFileRoute("/api/auth/register")({
	server: {
		handlers: {
			POST: async ({ request }) =>
				Effect.runPromise(
					Effect.gen(function* () {
						const body = yield* Effect.tryPromise(() => request.json());
						const data = yield* parseBody(registerUserSchema, body);

						const result = yield* registerUser(data);

						return response(
							{
								message: "Successfully register user",
								token: result.token,
							},
							HttpStatus.OK,
						);
					}).pipe(
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
						}),
						Effect.catchAll((err) => {
							console.error("ERR: ", err);

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
});
