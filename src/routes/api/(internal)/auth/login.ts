import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { HttpStatus, parseBody, response } from "@/lib/http";
import { loginUser } from "@/services/auth";
import type { AuthError, ValidationError } from "@/services/errors/errors";
import { loginUserSchema } from "@/types/zod.api";

export const Route = createFileRoute("/api/(internal)/auth/login")({
	server: {
		handlers: {
			POST: async ({ request }) =>
				Effect.runPromise(
					Effect.gen(function* () {
						const body = yield* Effect.tryPromise(() => request.json());
						const data = yield* parseBody(loginUserSchema, body);
						const result = yield* loginUser(data);

						return response(
							{
								message: "Successfully login user",
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
