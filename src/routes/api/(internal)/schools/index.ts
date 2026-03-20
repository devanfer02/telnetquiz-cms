import { DbLayer } from "@/lib/db";
import { HttpStatus, response } from "@/lib/http";
import { authMiddleware } from "@/middlewares/auth";
import { DatabaseError } from "@/services/errors/errors";
import { fetchAllSchools } from "@/services/schools";
import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";

export const Route = createFileRoute("/api/(internal)/schools/")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			GET: async () =>
				Effect.runPromise(
					Effect.gen(function* () {
						const schools = yield* fetchAllSchools;

						return response(
							{
								message: "Successfully fetch schools",
								data: { schools },
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
											message: "Failed to fetch schools",
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
