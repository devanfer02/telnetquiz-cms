import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, parseBody, response } from "@/lib/http";
import { authMiddleware } from "@/middlewares/auth";
import type {
	DatabaseError,
	NotFoundError,
	ValidationError,
} from "@/services/errors/errors";
import {
	fetchQuizByIdWithQuestionsAndOptions,
	submitQuizAnswers,
} from "@/services/quizzes";
import { quizSubmissionSchema } from "@/types/zod.api";

export const Route = createFileRoute("/api/(internal)/quiz/$id")({
	server: {
		handlers: ({ createHandlers }) =>
			createHandlers({
				GET: async ({ params }) =>
					Effect.runPromise(
						Effect.gen(function* () {
							const id = Number(params.id);

							if (Number.isNaN(id)) {
								return response(
									{
										message: "Invalid quiz id",
									},
									HttpStatus.BAD_REQUEST,
								);
							}

							const result = yield* fetchQuizByIdWithQuestionsAndOptions(id);

							const sanitizedResult = {
								...result,
								questions: result.questions.map((q) => ({
									...q,
									options: q.options.map(({ isCorrect, ...opt }) => opt),
								})),
							};

							return response(
								{
									message: "Successfully fetch quiz by id",
									data: sanitizedResult,
								},
								HttpStatus.OK,
							);
						}).pipe(
							Effect.provide(DbLayer),
							Effect.catchTags({
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
				POST: {
					middleware: [authMiddleware],
					handler: async ({ request, params, context }) =>
						Effect.runPromise(
							Effect.gen(function* () {
								const id = Number(params.id);

								if (Number.isNaN(id)) {
									return response(
										{
											message: "Invalid quiz id",
										},
										HttpStatus.BAD_REQUEST,
									);
								}

								const body = yield* Effect.tryPromise(() => request.json());
								const data = yield* parseBody(quizSubmissionSchema, body);

								const result = yield* submitQuizAnswers(
									id,
									context.user.id,
									data.answers,
								);

								return response(
									{
										message: result.passed
											? "Quiz completed successfully"
											: "Quiz completed with some wrong answers",
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
			}),
	},
});
