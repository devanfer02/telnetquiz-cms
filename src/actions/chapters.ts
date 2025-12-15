import { DbLayer } from "@/lib/db";
import { fetchAllChapters } from "@/services/chapters";
import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";

export const getAllChapters = createServerFn({
	method: "GET",
}).handler(async () => {
	return Effect.runPromise(
		fetchAllChapters.pipe(
			Effect.provide(DbLayer),
			Effect.tapError((err) =>
				Effect.logError("Failed to get all chapters. ERR: ", err),
			),
		),
	);
});
