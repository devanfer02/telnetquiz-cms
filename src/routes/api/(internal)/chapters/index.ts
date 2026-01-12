import { DbLayer } from "@/lib/db";
import { HttpStatus, response } from "@/lib/http";
import { authMiddleware } from "@/middlewares/auth";
import { fetchChaptersWithUserPerformance } from "@/services/chapters";
import { DatabaseError } from "@/services/errors/errors";
import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";

export const Route = createFileRoute("/api/(internal)/chapters/")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			GET: async ({ context }) =>
				Effect.runPromise(
					Effect.gen(function* () {
						const result = yield* fetchChaptersWithUserPerformance(
							context.user.id,
						);

						return response(
							{
								message: "Successfully fetch chapters by user's preference",
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
											message: "Database error",
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
