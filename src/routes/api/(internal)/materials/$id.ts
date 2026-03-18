import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, response } from "@/lib/http";
import type { DatabaseError, NotFoundError } from "@/services/errors/errors";
import { fetchStudyMaterialById } from "@/services/study-material";

export const Route = createFileRoute("/api/(internal)/materials/$id")({
	server: {
		handlers: {
			GET: async ({ params }) =>
				Effect.runPromise(
					Effect.gen(function* () {
						const id = Number(params.id);

						if (Number.isNaN(id)) {
							return response(
								{
									message: "Invalid material id",
								},
								HttpStatus.BAD_REQUEST,
							);
						}

						const result = yield* fetchStudyMaterialById(id);

						return response(
							{
								message: "Successfully fetch study material",
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
