import { createMiddleware, json } from "@tanstack/react-start";
import { HttpStatus } from "@/lib/http";

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 60_000;
setInterval(() => {
	const now = Date.now();
	for (const [key, entry] of store) {
		if (now > entry.resetAt) store.delete(key);
	}
}, CLEANUP_INTERVAL);

function getClientIp(request: Request): string {
	return (
		request.headers.get("cf-connecting-ip") ??
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		request.headers.get("x-real-ip") ??
		"unknown"
	);
}

export const createRateLimiter = (maxRequests: number, windowMs: number) =>
	createMiddleware().server(async ({ request, next }) => {
		const ip = getClientIp(request);
		const url = new URL(request.url);
		const key = `${ip}:${url.pathname}`;
		const now = Date.now();

		let entry = store.get(key);
		if (!entry || now > entry.resetAt) {
			entry = { count: 0, resetAt: now + windowMs };
			store.set(key, entry);
		}

		entry.count++;

		if (entry.count > maxRequests) {
			throw json(
				{ message: "Too many requests. Please try again later." },
				{ status: HttpStatus.TOO_MANY_REQUESTS },
			);
		}

		return next();
	});

export const authRateLimiter = createRateLimiter(20, 60_000);
export const ttsRateLimiter = createRateLimiter(30, 60_000);
