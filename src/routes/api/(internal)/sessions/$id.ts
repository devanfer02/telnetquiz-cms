import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, response } from "@/lib/http";
import type { DatabaseError, NotFoundError } from "@/services/errors/errors";
import { revokeSession } from "@/services/users";

export const Route = createFileRoute("/api/(internal)/sessions/$id")({
	server: {
		handlers: {
			DELETE: async ({ params }) =>
				Effect.runPromise(
					Effect.gen(function* () {
						const { id } = params;

						if (!id || id.trim() === "") {
							return response(
								{
									message: "Invalid session id",
								},
								HttpStatus.BAD_REQUEST,
							);
						}

						const result = yield* revokeSession(id);

						return response(
							{
								message: "Session revoked successfully",
								data: result,
							},
							HttpStatus.OK,
						);
					}).pipe(
						Effect.provide(DbLayer),
						Effect.catchTags({
							NotFoundError: (err: NotFoundError) =>
								Effect.succeed(
									response(
										{
											message: `${err.entity} with id ${err.id} not found`,
										},
										HttpStatus.NOT_FOUND,
									),
								),
							DatabaseError: (err: DatabaseError) =>
								Effect.succeed(
									response(
										{
											message: "Failed to revoke session",
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
