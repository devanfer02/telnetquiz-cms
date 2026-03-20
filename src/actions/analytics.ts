import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import {
	fetchAllSubmissions,
	fetchAllUsers,
	fetchAverageScores,
	fetchDashboardStats,
	fetchLeaderboard,
} from "@/services/analytics";

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

export const getAverageScores = createServerFn({
	method: "GET",
}).handler(async () => {
	return Effect.runPromise(
		fetchAverageScores.pipe(
			Effect.provide(DbLayer),
			Effect.catchAll((err) => {
				console.error("Failed to get average scores. ERR:", err);
				return Effect.succeed([]);
			}),
		),
	);
});

export const getLeaderboard = createServerFn({
	method: "GET",
}).handler(async () => {
	return Effect.runPromise(
		fetchLeaderboard.pipe(
			Effect.provide(DbLayer),
			Effect.catchAll((err) => {
				console.error("Failed to get leaderboard. ERR:", err);
				return Effect.succeed([]);
			}),
		),
	);
});

export const getDashboardStats = createServerFn({
	method: "GET",
}).handler(async () => {
	return Effect.runPromise(
		fetchDashboardStats.pipe(
			Effect.provide(DbLayer),
			Effect.catchAll((err) => {
				console.error("Failed to get dashboard stats. ERR:", err);
				return Effect.succeed({
					chapters: 0,
					quizzes: 0,
					studyMaterials: 0,
					questions: 0,
					submissions: 0,
					users: 0,
				});
			}),
		),
	);
});
