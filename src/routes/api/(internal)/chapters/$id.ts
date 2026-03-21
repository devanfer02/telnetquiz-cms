import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, response } from "@/lib/http";
import { authMiddleware } from "@/middlewares/auth";
import { fetchChapterById } from "@/services/chapters";
import type { DatabaseError, NotFoundError } from "@/services/errors/errors";

export const Route = createFileRoute("/api/(internal)/chapters/$id")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			GET: async ({ params, context }) =>
				Effect.runPromise(
					Effect.gen(function* () {
						const id = Number(params.id);

						if (Number.isNaN(id)) {
							return response(
								{
									message: "Invalid chapter id",
								},
								HttpStatus.BAD_REQUEST,
							);
						}

						const result = yield* fetchChapterById(id, context.user.id);

						return response(
							{
								message: "Successfully fetch chapter by id",
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
