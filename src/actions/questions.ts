import { DbLayer } from "@/lib/db";
import { fetchAllQuestions } from "@/services/questions";
import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";

export const getAllQuestions = createServerFn({
	method: "GET",
}).handler(async () => {
	return Effect.runPromise(
		fetchAllQuestions.pipe(
			Effect.provide(DbLayer),
			Effect.catchAll((err) => {
				console.error("Failed to get all questions. ERR:", err);

				return Effect.succeed([]);
			}),
		),
	);
});
