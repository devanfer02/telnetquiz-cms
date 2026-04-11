import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, parseBody, parseNumericId, response } from "@/lib/http";
import { withApiErrorHandling } from "@/lib/sentry/effect";
import { authMiddleware } from "@/middlewares/auth";
import {
	fetchQuizByIdWithQuestionsAndOptions,
	sanitizeQuizForClient,
	submitQuizAnswers,
} from "@/services/content/quizzes";
import { quizSubmissionSchema } from "@/types/zod.api";

export const Route = createFileRoute("/api/(internal)/quiz/$id")({
	server: {
		handlers: ({ createHandlers }) =>
			createHandlers({
				GET: async ({ params }) =>
					Effect.runPromise(
						withApiErrorHandling(
							Effect.gen(function* () {
								const id = yield* parseNumericId(params.id, "quiz id");
								const result = yield* fetchQuizByIdWithQuestionsAndOptions(id);

								return response(
									{
										message: "Successfully fetch quiz by id",
										data: sanitizeQuizForClient(result),
									},
									HttpStatus.OK,
								);
							}).pipe(Effect.provide(DbLayer)),
						),
					),
				POST: {
					middleware: [authMiddleware],
					handler: async ({ request, params, context }) =>
						Effect.runPromise(
							withApiErrorHandling(
								Effect.gen(function* () {
									const id = yield* parseNumericId(params.id, "quiz id");
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
								}).pipe(Effect.provide(DbLayer)),
							),
						),
				},
			}),
	},
});
