import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, parseBody, response } from "@/lib/http";
import { withApiErrorHandling } from "@/lib/sentry/effect";
import { authMiddleware } from "@/middlewares/auth";
import { verifyQuizAnswer } from "@/services/quizzes";
import { verifyAnswerSchema } from "@/types/zod.api";

export const Route = createFileRoute("/api/(internal)/quiz/verify")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			POST: async ({ request }) =>
				Effect.runPromise(
					withApiErrorHandling(
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
						}).pipe(Effect.provide(DbLayer)),
					),
				),
		},
	},
});
