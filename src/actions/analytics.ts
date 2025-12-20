import { DbLayer } from "@/lib/db";
import { fetchAllSubmissions, fetchAllUsers } from "@/services/analytics";
import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";

export const getAllUsers = createServerFn({
	method: "GET",
}).handler(async () => {
	return Effect.runPromise(
		fetchAllUsers.pipe(
			Effect.provide(DbLayer),
			Effect.catchAll((err) => {
				console.error("Failed to get all users. ERR:", err);
				return Effect.succeed([]);
			}),
		),
	);
});

export const getAllSubmissions = createServerFn({
	method: "GET",
}).handler(async () => {
	return Effect.runPromise(
		fetchAllSubmissions.pipe(
			Effect.provide(DbLayer),
			Effect.catchAll((err) => {
				console.error("Failed to get all submissions. ERR:", err);
				return Effect.succeed([]);
			}),
		),
	);
});
