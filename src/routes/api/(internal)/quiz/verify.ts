import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, parseBody, response } from "@/lib/http";
import type {
	DatabaseError,
	NotFoundError,
	ValidationError,
} from "@/services/errors/errors";
import { verifyQuizAnswer } from "@/services/quizzes";
import { verifyAnswerSchema } from "@/types/zod.api";
import { authMiddleware } from "@/middlewares/auth";

export const Route = createFileRoute("/api/(internal)/quiz/verify")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			POST: async ({ request }) =>
				Effect.runPromise(
					Effect.gen(function* () {
						const body = yield* Effect.tryPromise(() => request.json());
						const data = yield* parseBody(verifyAnswerSchema, body);

						const result = yield* verifyQuizAnswer(
							data.quiz_id,
							data.question_id,
							data.answered_option_id,
						);

						return response(
							{
								message: result.correct
									? "Answer is correct"
									: "Answer is incorrect",
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
							NotFoundError: (err: NotFoundError) =>
								Effect.succeed(
									response(
										{
											message: `${err.entity} with id ${err.id} not found`,
										},
										HttpStatus.NOT_FOUND,
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
