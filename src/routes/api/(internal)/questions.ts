import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, response } from "@/lib/http";
import { withApiErrorHandling } from "@/lib/sentry/effect";
import {
	fetchQuestionsByType,
	formatQuestionsForApi,
} from "@/services/questions";

export const Route = createFileRoute("/api/(internal)/questions")({
	server: {
		handlers: {
			GET: ({ request }) =>
				Effect.runPromise(
					withApiErrorHandling(
						Effect.gen(function* () {
							const url = new URL(request.url);
							const type = url.searchParams.get("type");

							if (!type || (type !== "pretest" && type !== "quiz")) {
								return response(
									{
										message: "Invalid or missing type search params",
									},
									HttpStatus.BAD_REQUEST,
								);
							}

							const questions = yield* fetchQuestionsByType(type);

							return response(
								{
									message: "Successfully fetch questions",
									data: {
										questions: formatQuestionsForApi(questions),
									},
								},
								HttpStatus.OK,
							);
						}).pipe(Effect.provide(DbLayer)),
					),
				),
		},
	},
});
