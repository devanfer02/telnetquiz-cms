import { DbLayer } from "@/lib/db";
import { HttpStatus, response } from "@/lib/http";
import { authMiddleware } from "@/middlewares/auth";
import { DatabaseError, NotFoundError } from "@/services/errors/errors";
import { revokeSession } from "@/services/users";
import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";

export const Route = createFileRoute("/api/(internal)/sessions")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			DELETE: async ({ context }) =>
				Effect.runPromise(
					Effect.gen(function* () {
						const sessionId = context.session.id;

						const result = yield* revokeSession(sessionId);

						return yield* Effect.succeed(
							response(
								{
									message: "Session revoked successfully",
									data: result,
								},
								HttpStatus.OK,
							),
						);
					}).pipe(
						Effect.provide(DbLayer),
						Effect.catchTags({
							NotFoundError: (err: NotFoundError) =>
								Effect.succeed(
									response(
										{
											message: "Failed to find specific session id",
											error: err.message,
										},
										HttpStatus.NOT_FOUND,
									),
								),
							DatabaseError: (err: DatabaseError) =>
								Effect.succeed(
									response(
										{
											message: `Failed to delete session`,
											error: err.message,
										},
										HttpStatus.NOT_FOUND,
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
