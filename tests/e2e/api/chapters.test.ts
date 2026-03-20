import { beforeAll, describe, expect, it } from "vitest";
import {
	api,
	loginTestUser,
	measureResponseTime,
	withApiKey,
	withAuth,
	RESPONSE_THRESHOLD_MS,
} from "../helpers";

describe("GET /api/chapters", () => {
	let token: string;

	beforeAll(async () => {
		token = await loginTestUser();
	});

	// --- Positive ---

	it("returns chapters with user performance data", async () => {
		const res = await withAuth(api().get("/api/chapters"), token);

		expect(res.status).toBe(200);
		expect(res.body.message).toContain("Successfully");
		expect(res.body.data).toBeDefined();
		expect(typeof res.body.data).toBe("object");
	});

	// --- Negative ---

	it("returns 401 when x-api-key is missing", async () => {
		const res = await api().get("/api/chapters");

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Unauthorized");
	});

	it("returns 401 when bearer token is missing", async () => {
		const res = await withApiKey(api().get("/api/chapters"));

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Unauthorized");
	});

	it("returns 401 when bearer token is invalid", async () => {
		const res = await withAuth(api().get("/api/chapters"), "invalid-token");

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Unauthorized");
	});

	// --- Benchmark ---

	it("responds within 2000ms", async () => {
		const { response, durationMs } = await measureResponseTime(
			"GET /api/chapters",
			() => withAuth(api().get("/api/chapters"), token),
		);

		expect(response.status).toBe(200);
		console.log(`[benchmark] GET /api/chapters: ${durationMs}ms`);
		expect(durationMs).toBeLessThan(RESPONSE_THRESHOLD_MS);
	});
});
