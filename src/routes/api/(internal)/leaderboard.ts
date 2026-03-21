import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, response } from "@/lib/http";
import { withApiErrorHandling } from "@/lib/sentry/effect";
import { authMiddleware } from "@/middlewares/auth";
import { fetchLeaderboard } from "@/services/users";

export const Route = createFileRoute("/api/(internal)/leaderboard")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			GET: async ({ request, context }) =>
				Effect.runPromise(
					withApiErrorHandling(
						Effect.gen(function* () {
							const url = new URL(request.url);
							const limitParam = url.searchParams.get("limit");
							const cursorParam = url.searchParams.get("cursor");

							const limit = limitParam ? Number(limitParam) : 10;
							const cursor = cursorParam ? Number(cursorParam) : undefined;

							if (Number.isNaN(limit) || limit < 1 || limit > 100) {
								return response(
									{
										message:
											"Invalid limit parameter. Must be between 1 and 100.",
									},
									HttpStatus.BAD_REQUEST,
								);
							}

							if (
								cursorParam &&
								(Number.isNaN(cursor) || (cursor as number) < 0)
							) {
								return response(
									{
										message: "Invalid cursor parameter.",
									},
									HttpStatus.BAD_REQUEST,
								);
							}

							const result = yield* fetchLeaderboard(
								context.user.id,
								limit,
								cursor,
							);

							return response(
								{
									message: "Successfully fetch leaderboard",
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
