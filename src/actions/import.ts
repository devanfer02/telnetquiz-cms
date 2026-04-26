import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { commitImport, previewImport } from "@/services/import/sheets";

export const previewImportAction = createServerFn({
	method: "POST",
}).handler(async () => {
	return Effect.runPromise(
		previewImport.pipe(
			Effect.provide(DbLayer),
			Effect.catchAll((err) => {
				console.error("Failed to preview spreadsheet import. ERR:", err);
				return Effect.succeed(null);
			}),
		),
	);
});

export const commitImportAction = createServerFn({
	method: "POST",
}).handler(async () => {
	return Effect.runPromise(
		commitImport.pipe(
			Effect.provide(DbLayer),
			Effect.catchAll((err) => {
				console.error("Failed to commit spreadsheet import. ERR:", err);
				return Effect.succeed(null);
			}),
		),
	);
});
