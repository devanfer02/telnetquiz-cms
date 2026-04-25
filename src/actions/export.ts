import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { env } from "@/lib/env";
import { exportContentToSpreadsheet } from "@/services/export/sheets";

export const exportContentAction = createServerFn({
	method: "POST",
}).handler(async () => {
	return Effect.runPromise(
		exportContentToSpreadsheet.pipe(
			Effect.provide(DbLayer),
			Effect.catchAll((err) => {
				console.error("Failed to export content to spreadsheet. ERR:", err);
				return Effect.succeed(null);
			}),
		),
	);
});

export const getSpreadsheetUrl = createServerFn({
	method: "GET",
}).handler(async () => {
	return {
		url: `https://docs.google.com/spreadsheets/d/${env.GOOGLE_SHEET_ID}`,
	};
});
