import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { refreshTokens, sessions, users } from "@/database/schema";
import {
	generateRefreshToken,
	hashRefreshToken,
	REFRESH_TOKEN_TTL,
	SESSION_EXTENSION,
} from "@/lib/auth/refresh-token";
import { Db } from "@/lib/db";
import { dbTryPromise } from "@/lib/retry";
import { AuthError, DatabaseError } from "../errors/errors";

export const createRefreshToken = (userId: string, sessionToken: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const rawToken = generateRefreshToken();
		const tokenHash = hashRefreshToken(rawToken);

		yield* dbTryPromise({
			try: () =>
				db.insert(refreshTokens).values({
					tokenHash,
					userId,
					sessionToken,
					expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
				}),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to create refresh token",
				}),
		});

		return rawToken;
	});

export const rotateRefreshToken = (rawToken: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const tokenHash = hashRefreshToken(rawToken);

		const rows = yield* dbTryPromise({
			try: () =>
				db
					.select()
					.from(refreshTokens)
					.where(eq(refreshTokens.tokenHash, tokenHash))
					.limit(1),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to look up refresh token",
				}),
		});

		if (rows.length === 0) {
			return yield* Effect.fail(
				new AuthError({ message: "Invalid refresh token" }),
			);
		}

		const stored = rows[0];

		if (stored.expiresAt < new Date()) {
			yield* dbTryPromise({
				try: () =>
					db
						.delete(refreshTokens)
						.where(eq(refreshTokens.tokenHash, tokenHash)),
				catch: (error) =>
					new DatabaseError({
						cause: error,
						message: "Failed to delete expired refresh token",
					}),
			});
			return yield* Effect.fail(
				new AuthError({ message: "Refresh token expired" }),
			);
		}

		const userRows = yield* dbTryPromise({
			try: () =>
				db
					.select({ banned: users.banned })
					.from(users)
					.where(eq(users.id, stored.userId))
					.limit(1),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to check user status",
				}),
		});

		if (userRows.length === 0 || userRows[0].banned) {
			return yield* Effect.fail(
				new AuthError({ message: "User not found or banned" }),
			);
		}

		yield* dbTryPromise({
			try: () =>
				db
					.update(sessions)
					.set({ expiresAt: new Date(Date.now() + SESSION_EXTENSION) })
					.where(eq(sessions.token, stored.sessionToken)),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to extend session",
				}),
		});

		yield* dbTryPromise({
			try: () =>
				db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash)),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to delete old refresh token",
				}),
		});

		const newRawToken = yield* createRefreshToken(
			stored.userId,
			stored.sessionToken,
		);

		return {
			sessionToken: stored.sessionToken,
			refreshToken: newRawToken,
		};
	});

export const deleteRefreshTokensBySession = (sessionToken: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		yield* dbTryPromise({
			try: () =>
				db
					.delete(refreshTokens)
					.where(eq(refreshTokens.sessionToken, sessionToken)),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to delete refresh tokens for session",
				}),
		});
	});

export const deleteRefreshTokensByUser = (userId: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		yield* dbTryPromise({
			try: () =>
				db.delete(refreshTokens).where(eq(refreshTokens.userId, userId)),
			catch: (error) =>
				new DatabaseError({
					cause: error,
					message: "Failed to delete refresh tokens for user",
				}),
		});
	});
