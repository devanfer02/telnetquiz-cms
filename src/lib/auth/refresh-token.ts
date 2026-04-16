import { createHash, randomBytes } from "node:crypto";

export const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
export const SESSION_EXTENSION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function generateRefreshToken(): string {
	return randomBytes(32).toString("hex");
}

export function hashRefreshToken(token: string): string {
	return createHash("sha256").update(token).digest("hex");
}
