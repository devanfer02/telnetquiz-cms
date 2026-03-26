import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, parseBody, response } from "@/lib/http";
import type { DatabaseError, ValidationError } from "@/services/errors/errors";
import { fetchStudyMaterialsByIds } from "@/services/study-material";
import { bulkMaterialsSchema } from "@/types/zod.api";

export const Route = createFileRoute("/api/(internal)/materials/bulk-get")({
	server: {
		handlers: {
			POST: async ({ request }) =>
				Effect.runPromise(
					Effect.gen(function* () {
						const body = yield* Effect.tryPromise(() => request.json());
						const data = yield* parseBody(bulkMaterialsSchema, body);

						const materials = yield* fetchStudyMaterialsByIds(
							data.material_ids,
						);

						return response(
							{
								message: "Successfully fetched study materials",
								data: { materials },
							},
							HttpStatus.OK,
						);
					}).pipe(
						Effect.provide(DbLayer),
						Effect.catchTags({
							ValidationError: (err: ValidationError) =>
								Effect.succeed(
									response(
										{
											message: "Validation failed",
											error: err.errors,
										},
										HttpStatus.BAD_REQUEST,
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
