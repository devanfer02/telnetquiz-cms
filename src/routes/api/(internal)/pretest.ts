import { DbLayer } from "@/lib/db";
import { HttpStatus, parseBody, response } from "@/lib/http";
import { authMiddleware } from "@/middlewares/auth";
import { DatabaseError, ValidationError } from "@/services/errors/errors";
import { submitPretest } from "@/services/pretest";
import { pretestSubmissionSchema } from "@/types/zod.api";
import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";

export const Route = createFileRoute("/api/(internal)/pretest")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			POST: async ({ request, context }) =>
				Effect.runPromise(
					Effect.gen(function* () {
						const body = yield* Effect.tryPromise(() => request.json());
						const data = yield* parseBody(pretestSubmissionSchema, body);

						const result = yield* submitPretest(
							context.user.id,
							data.pretest_submissions,
						);

						return response(
							{
								message: "Successfully judged user pretest submission",
								data: result,
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
											error: err.errors,
										},
										HttpStatus.BAD_REQUEST,
									),
								),
							DatabaseError: (err: DatabaseError) =>
								Effect.succeed(
									response(
										{
											message: "Database error",
											error: err.message,
										},
										HttpStatus.INTERNAL_SERVER_ERROR,
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
