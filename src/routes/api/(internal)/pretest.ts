import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, parseBody, response } from "@/lib/http";
import { withApiErrorHandling } from "@/lib/sentry/effect";
import { authMiddleware } from "@/middlewares/auth";
import { submitPretest } from "@/services/content/pretest";
import {
	fetchQuestionsByType,
	formatQuestionsForApi,
} from "@/services/content/questions";
import { pretestSubmissionSchema } from "@/types/zod.api";

export const Route = createFileRoute("/api/(internal)/pretest")({
	server: {
		handlers: ({ createHandlers }) =>
			createHandlers({
				GET: () =>
					Effect.runPromise(
						withApiErrorHandling(
							Effect.gen(function* () {
								const questions = yield* fetchQuestionsByType("pretest");

								return response(
									{
										message: "Successfully fetch pretest questions",
										data: {
											questions: formatQuestionsForApi(questions),
										},
									},
									HttpStatus.OK,
								);
							}).pipe(Effect.provide(DbLayer)),
						),
					),
				POST: {
					middleware: [authMiddleware],
					handler: async ({ request, context }) =>
						Effect.runPromise(
							withApiErrorHandling(
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
								}).pipe(Effect.provide(DbLayer)),
							),
						),
				},
			}),
	},
});
