import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, response } from "@/lib/http";
import { withApiErrorHandling } from "@/lib/sentry/effect";
import {
	fetchSchoolsPaginated,
	fetchVisibleSchools,
} from "@/services/users/schools";

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
						withApiErrorHandling(
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
							}).pipe(Effect.provide(DbLayer)),
						),
					);
				}

				return Effect.runPromise(
					withApiErrorHandling(
						Effect.gen(function* () {
							const schools = yield* fetchVisibleSchools;

							return response(
								{
									message: "Successfully fetch schools",
									data: { schools },
								},
								HttpStatus.OK,
							);
						}).pipe(Effect.provide(DbLayer)),
					),
				);
			},
		},
	},
});
