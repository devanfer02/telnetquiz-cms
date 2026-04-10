import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, parseBody, response } from "@/lib/http";
import { withApiErrorHandling } from "@/lib/sentry/effect";
import { authMiddleware } from "@/middlewares/auth";
import { fetchQuizMaterials } from "@/services/quizzes";
import { quizMaterialsSchema } from "@/types/zod.api";

export const Route = createFileRoute("/api/(internal)/quiz/materials")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			POST: async ({ request }) =>
				Effect.runPromise(
					withApiErrorHandling(
						Effect.gen(function* () {
							const body = yield* Effect.tryPromise(() => request.json());
							const data = yield* parseBody(quizMaterialsSchema, body);
							const result = yield* fetchQuizMaterials(data.quiz_id);

							return response(
								{
									message: "Quiz materials fetched successfully",
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
