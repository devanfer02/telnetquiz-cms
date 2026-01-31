import { desc, eq, sql } from "drizzle-orm";
import { submissions, users } from "@/database/schema";
import { Db } from "@/lib/db";
import { EditUserFormData } from "@/types/zod";
import { Effect } from "effect";
import { AuthError, DatabaseError, NotFoundError } from "./errors/errors";
import { Auth } from "@/lib/auth";
import type { UpdateProfileFormData } from "@/types/zod.api";

export const patchUser = (id: string, user: EditUserFormData) =>
	Effect.gen(function* () {
		const { db } = yield* Db;
		const { auth } = yield* Auth;

		const result = yield* Effect.tryPromise({
			try: () =>
				db
					.update(users)
					.set({
						name: user.fullname,
						email: user.email,
					})
					.where(eq(users.id, id))
					.returning(),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to update user with id ${id}`,
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(new NotFoundError({ id, entity: "User" }));
		}

		const password = user.password;

		if (password) {
			yield* Effect.tryPromise({
				try: () =>
					auth.api.setUserPassword({
						body: {
							newPassword: password,
							userId: result[0].id,
						},
					}),
				catch: (err) => {
					new AuthError({
						message: (err as Error).message,
					});
				},
			});
		}

		return result[0];
	});

export const deleteUser = (id: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		yield* Effect.tryPromise({
			try: () => db.delete(users).where(eq(users.id, id)),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: `Failed to delete user with id ${id}`,
				}),
		});

		return { success: true, id };
	});

export const fetchLeaderboard = (
	userId: string,
	limit: number,
	cursor?: number,
) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		// Get leaderboard with total scores
		const leaderboardQuery = db
			.select({
				userId: users.id,
				fullname: users.name,
				image: users.image,
				totalScore: sql<number>`COALESCE(SUM(${submissions.score}), 0)`.as(
					"total_score",
				),
			})
			.from(users)
			.leftJoin(submissions, eq(users.id, submissions.userId))
			.groupBy(users.id, users.name, users.image)
			.orderBy(desc(sql`total_score`), users.id)
			.limit(limit + 1);

		const leaderboard = yield* Effect.tryPromise({
			try: () => (cursor ? leaderboardQuery.offset(cursor) : leaderboardQuery),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to fetch leaderboard",
				}),
		});

		// Check if there's a next page
		const hasNextPage = leaderboard.length > limit;
		const items = hasNextPage ? leaderboard.slice(0, limit) : leaderboard;
		const nextCursor = hasNextPage ? (cursor ?? 0) + limit : null;

		// Get current user's rank
		const userRankResult = yield* Effect.tryPromise({
			try: () =>
				db.execute(sql`
					SELECT rank FROM (
						SELECT
							${users.id} as user_id,
							ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(${submissions.score}), 0) DESC, ${users.id}) as rank
						FROM ${users}
						LEFT JOIN ${submissions} ON ${users.id} = ${submissions.userId}
						GROUP BY ${users.id}
					) ranked
					WHERE user_id = ${userId}
				`),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to fetch user rank",
				}),
		});

		const userRank = userRankResult.rows[0]?.rank as number | null;

		// Get current user's total score
		const userScoreResult = yield* Effect.tryPromise({
			try: () =>
				db
					.select({
						fullname: users.name,
						image: users.image,
						totalScore: sql<number>`COALESCE(SUM(${submissions.score}), 0)`.as(
							"total_score",
						),
					})
					.from(users)
					.leftJoin(submissions, eq(users.id, submissions.userId))
					.where(eq(users.id, userId))
					.groupBy(users.id, users.name, users.image),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to fetch user score",
				}),
		});

		const currentUser = userScoreResult[0] ?? null;

		return {
			leaderboard: items.map((item, index) => ({
				rank: (cursor ?? 0) + index + 1,
				userId: item.userId,
				fullname: item.fullname,
				image: item.image,
				totalScore: Number(item.totalScore),
			})),
			currentUser: currentUser
				? {
						rank: Number(userRank),
						fullname: currentUser.fullname,
						image: currentUser.image,
						totalScore: Number(currentUser.totalScore),
					}
				: null,
			pagination: {
				nextCursor,
				hasNextPage,
			},
		};
	});

export const fetchUserProfile = (userId: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* Effect.tryPromise({
			try: () => db.select().from(users).where(eq(users.id, userId)).limit(1),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to fetch user profile",
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(
				new NotFoundError({ id: userId, entity: "User" }),
			);
		}

		const user = result[0];

		return {
			id: user.id,
			fullname: user.name,
			email: user.email,
			image: user.image,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};
	});

export const updateUserProfile = (
	userId: string,
	data: UpdateProfileFormData,
) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const updateData: Partial<{ name: string; image: string }> = {};

		if (data.fullname) {
			updateData.name = data.fullname;
		}

		if (data.image) {
			updateData.image = data.image;
		}

		if (Object.keys(updateData).length === 0) {
			// Nothing to update, just return current profile
			return yield* fetchUserProfile(userId);
		}

		const result = yield* Effect.tryPromise({
			try: () =>
				db
					.update(users)
					.set(updateData)
					.where(eq(users.id, userId))
					.returning(),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to update user profile",
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(
				new NotFoundError({ id: userId, entity: "User" }),
			);
		}

		const user = result[0];

		return {
			id: user.id,
			fullname: user.name,
			email: user.email,
			image: user.image,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};
	});
