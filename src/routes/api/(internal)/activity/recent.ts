import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, response } from "@/lib/http";
import { authMiddleware } from "@/middlewares/auth";
import { fetchRecentActivity } from "@/services/activity";
import type { DatabaseError } from "@/services/errors/errors";

export const Route = createFileRoute("/api/(internal)/activity/recent")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			GET: async ({ context }) =>
				Effect.runPromise(
					Effect.gen(function* () {
						const result = yield* fetchRecentActivity(context.user.id);

						return response(
							{
								message: "Successfully fetch recent activity",
								data: result,
							},
							HttpStatus.OK,
						);
					}).pipe(
						Effect.provide(DbLayer),
						Effect.catchTags({
							DatabaseError: (err: DatabaseError) =>
								Effect.succeed(
									response(
										{
											message: "Failed to fetch recent activity",
											error: err.message,
										},
										HttpStatus.INTERNAL_SERVER_ERROR,
									),
								),
						}),
						Effect.catchAll((err) => {
							console.error("ERR: ", err);
							return Effect.succeed(
								response(
									{
										message: "Internal server error",
									},
									HttpStatus.INTERNAL_SERVER_ERROR,
								),
							);
						}),
					),
				),
		},
	},
});
