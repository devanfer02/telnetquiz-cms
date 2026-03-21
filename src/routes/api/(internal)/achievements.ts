import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, response } from "@/lib/http";
import { withApiErrorHandling } from "@/lib/sentry/effect";
import { authMiddleware } from "@/middlewares/auth";
import { fetchUserAchievements } from "@/services/users";

export const Route = createFileRoute("/api/(internal)/achievements")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			GET: async ({ context }) =>
				Effect.runPromise(
					withApiErrorHandling(
						Effect.gen(function* () {
							const result = yield* fetchUserAchievements(context.user.id);

							return response(
								{
									message: "Successfully fetch achievements",
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
