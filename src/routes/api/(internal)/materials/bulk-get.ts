import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, parseBody, response } from "@/lib/http";
import { withApiErrorHandling } from "@/lib/sentry/effect";
import { fetchStudyMaterialsByIds } from "@/services/study-material";
import { bulkMaterialsSchema } from "@/types/zod.api";

export const Route = createFileRoute("/api/(internal)/materials/bulk-get")({
	server: {
		handlers: {
			POST: async ({ request }) =>
				Effect.runPromise(
					withApiErrorHandling(
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
						}).pipe(Effect.provide(DbLayer)),
					),
				),
		},
	},
});
