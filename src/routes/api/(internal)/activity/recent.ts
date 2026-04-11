import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, response } from "@/lib/http";
import { withApiErrorHandling } from "@/lib/sentry/effect";
import { authMiddleware } from "@/middlewares/auth";
import { fetchRecentActivity } from "@/services/users/activity";

export const Route = createFileRoute("/api/(internal)/activity/recent")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			GET: async ({ context }) =>
				Effect.runPromise(
					withApiErrorHandling(
						Effect.gen(function* () {
							const result = yield* fetchRecentActivity(context.user.id);

							return response(
								{
									message: "Successfully fetch recent activity",
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
