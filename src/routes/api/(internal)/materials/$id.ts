import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, parseNumericId, response } from "@/lib/http";
import { withApiErrorHandling } from "@/lib/sentry/effect";
import { fetchStudyMaterialById } from "@/services/content/study-material";

export const Route = createFileRoute("/api/(internal)/materials/$id")({
	server: {
		handlers: {
			GET: async ({ params }) =>
				Effect.runPromise(
					withApiErrorHandling(
						Effect.gen(function* () {
							const id = yield* parseNumericId(params.id, "material id");
							const result = yield* fetchStudyMaterialById(id);

							return response(
								{
									message: "Successfully fetch study material",
									data: result,
								},
								HttpStatus.OK,
							);
						}).pipe(Effect.provide(DbLayer)),
					),
				),
		},
	},
});
