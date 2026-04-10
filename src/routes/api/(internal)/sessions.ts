import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, response } from "@/lib/http";
import { withApiErrorHandling } from "@/lib/sentry/effect";
import { authMiddleware } from "@/middlewares/auth";
import { revokeSession } from "@/services/users";

export const Route = createFileRoute("/api/(internal)/sessions")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			DELETE: async ({ context }) =>
				Effect.runPromise(
					withApiErrorHandling(
						Effect.gen(function* () {
							const result = yield* revokeSession(context.session.id);

							return response(
								{
									message: "Session revoked successfully",
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
