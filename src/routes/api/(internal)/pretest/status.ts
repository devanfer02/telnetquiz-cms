import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, response } from "@/lib/http";
import { withApiErrorHandling } from "@/lib/sentry/effect";
import { authMiddleware } from "@/middlewares/auth";
import { checkPretestStatus } from "@/services/content/pretest";

export const Route = createFileRoute("/api/(internal)/pretest/status")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			GET: async ({ context }) =>
				Effect.runPromise(
					withApiErrorHandling(
						Effect.gen(function* () {
							const result = yield* checkPretestStatus(context.user.id);

							return response(
								{
									message: "Successfully fetch pretest status",
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
