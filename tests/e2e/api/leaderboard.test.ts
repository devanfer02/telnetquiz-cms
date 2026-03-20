import { beforeAll, describe, expect, it } from "vitest";
import {
	api,
	loginTestUser,
	measureResponseTime,
	withApiKey,
	withAuth,
	RESPONSE_THRESHOLD_MS,
} from "../helpers";

describe("GET /api/leaderboard", () => {
	let token: string;

	beforeAll(async () => {
		token = await loginTestUser();
	});

	// --- Positive ---

	it("returns leaderboard data", async () => {
		const res = await withAuth(api().get("/api/leaderboard"), token);

		expect(res.status).toBe(200);
		expect(res.body.message).toContain("Successfully");
		expect(res.body.data).toBeDefined();
	});

	it("supports limit query parameter", async () => {
		const res = await withAuth(
			api().get("/api/leaderboard?limit=5"),
			token,
		);

		expect(res.status).toBe(200);
		expect(res.body.data).toBeDefined();
	});

	it("supports cursor pagination", async () => {
		const res = await withAuth(
			api().get("/api/leaderboard?limit=5&cursor=0"),
			token,
		);

		expect(res.status).toBe(200);
		expect(res.body.data).toBeDefined();
	});

	// --- Negative ---

	it("returns 401 when x-api-key is missing", async () => {
		const res = await api().get("/api/leaderboard");

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Unauthorized");
	});

	it("returns 401 when bearer token is missing", async () => {
		const res = await withApiKey(api().get("/api/leaderboard"));

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Unauthorized");
	});

	it("returns 401 when bearer token is invalid", async () => {
		const res = await withAuth(
			api().get("/api/leaderboard"),
			"invalid-token",
		);

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Unauthorized");
	});

	it("returns 400 for invalid limit", async () => {
		const res = await withAuth(
			api().get("/api/leaderboard?limit=999"),
			token,
		);

		expect(res.status).toBe(400);
	});

	it("returns 400 for invalid cursor", async () => {
		const res = await withAuth(
			api().get("/api/leaderboard?cursor=-1"),
			token,
		);

		expect(res.status).toBe(400);
	});

	// --- Benchmark ---

	it("responds within 1000ms", async () => {
		const { response, durationMs } = await measureResponseTime(
			"GET /api/leaderboard",
			() => withAuth(api().get("/api/leaderboard"), token),
		);

		expect(response.status).toBe(200);
		console.log(`[benchmark] GET /api/leaderboard: ${durationMs}ms`);
		expect(durationMs).toBeLessThan(RESPONSE_THRESHOLD_MS);
	});
});
