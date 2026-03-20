import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, response } from "@/lib/http";
import type { DatabaseError } from "@/services/errors/errors";
import { fetchSchoolsPaginated, fetchVisibleSchools } from "@/services/schools";

export const Route = createFileRoute("/api/(internal)/schools/")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const url = new URL(request.url);
				const search = url.searchParams.get("search") || undefined;
				const limitParam = url.searchParams.get("limit");
				const offsetParam = url.searchParams.get("offset");

				const isPaginated =
					limitParam !== null || offsetParam !== null || search !== undefined;

				if (isPaginated) {
					const limit = limitParam ? Number(limitParam) : 20;
					const offset = offsetParam ? Number(offsetParam) : 0;

					return Effect.runPromise(
						Effect.gen(function* () {
							const result = yield* fetchSchoolsPaginated(
								search,
								limit,
								offset,
							);

							return response(
								{
									message: "Successfully fetch schools",
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
					);
				}

				return Effect.runPromise(
					Effect.gen(function* () {
						const schools = yield* fetchVisibleSchools;

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
				);
			},
		},
	},
});
