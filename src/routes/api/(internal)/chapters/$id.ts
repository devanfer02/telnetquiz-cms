import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, parseNumericId, response } from "@/lib/http";
import { withApiErrorHandling } from "@/lib/sentry/effect";
import { authMiddleware } from "@/middlewares/auth";
import { fetchChapterById } from "@/services/content/chapters";

export const Route = createFileRoute("/api/(internal)/chapters/$id")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			GET: async ({ params, context }) =>
				Effect.runPromise(
					withApiErrorHandling(
						Effect.gen(function* () {
							const id = yield* parseNumericId(params.id, "chapter id");
							const result = yield* fetchChapterById(id, context.user.id);

							return response(
								{
									message: "Successfully fetch chapter by id",
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
