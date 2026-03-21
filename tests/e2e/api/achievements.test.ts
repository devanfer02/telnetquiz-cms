import { beforeAll, describe, expect, it } from "vitest";
import {
	api,
	loginTestUser,
	measureResponseTime,
	withApiKey,
	withAuth,
	RESPONSE_THRESHOLD_MS,
} from "../helpers";

describe("GET /api/achievements", () => {
	let token: string;

	beforeAll(async () => {
		token = await loginTestUser();
	});

	// --- Positive ---

	it("returns user achievements", async () => {
		const res = await withAuth(api().get("/api/achievements"), token);

		expect(res.status).toBe(200);
		expect(res.body.message).toContain("Successfully");
		expect(res.body.data).toBeDefined();
		expect(res.body.data.achievements).toBeDefined();
		expect(Array.isArray(res.body.data.achievements)).toBe(true);

		const achievement = res.body.data.achievements[0];
		if (achievement) {
			expect(achievement).toHaveProperty("id");
			expect(achievement).toHaveProperty("title");
			expect(achievement).toHaveProperty("description");
			expect(achievement).toHaveProperty("unlocked");
			expect(achievement).toHaveProperty("unlockedAt");
		}
	});

	// --- Negative ---

	it("returns 401 when x-api-key is missing", async () => {
		const res = await api().get("/api/achievements");

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Unauthorized");
	});

	it("returns 401 when bearer token is missing", async () => {
		const res = await withApiKey(api().get("/api/achievements"));

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Unauthorized");
	});

	it("returns 401 when bearer token is invalid", async () => {
		const res = await withAuth(
			api().get("/api/achievements"),
			"invalid-token",
		);

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Unauthorized");
	});

	// --- Benchmark ---

	it("responds within the performance threshold", async () => {
		const { response, durationMs } = await measureResponseTime(
			"GET /api/achievements",
			() => withAuth(api().get("/api/achievements"), token),
		);

		expect(response.status).toBe(200);
		expect(durationMs).toBeLessThan(RESPONSE_THRESHOLD_MS);
	});
});
