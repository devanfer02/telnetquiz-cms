import { DbLayer } from "@/lib/db";
import { HttpStatus, response } from "@/lib/http";
import { authMiddleware } from "@/middlewares/auth";
import type { DatabaseError } from "@/services/errors/errors";
import { fetchUserAchievements } from "@/services/users";
import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";

export const Route = createFileRoute("/api/(internal)/achievements")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			GET: async ({ request, context }) =>
				Effect.runPromise(
					Effect.gen(function* () {
						const result = yield* fetchUserAchievements(context.user.id);

						return response(
							{
								message: "Successfully fetch achievements",
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
											message: "Failed to fetch achievements",
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
