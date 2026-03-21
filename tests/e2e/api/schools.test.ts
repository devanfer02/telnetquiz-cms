import { describe, expect, it } from "vitest";
import {
	api,
	measureResponseTime,
	withApiKey,
	RESPONSE_THRESHOLD_MS,
} from "../helpers";

describe("GET /api/schools", () => {
	// --- Positive ---

	it("returns schools list", async () => {
		const res = await withApiKey(api().get("/api/schools"));

		expect(res.status).toBe(200);
		expect(res.body.message).toContain("Successfully");
		expect(res.body.data).toBeDefined();
	});

	it("supports paginated mode with search", async () => {
		const res = await withApiKey(
			api().get("/api/schools?search=SMA&limit=5&offset=0"),
		);

		expect(res.status).toBe(200);
		expect(res.body.data).toBeDefined();
	});

	it("supports limit and offset without search", async () => {
		const res = await withApiKey(
			api().get("/api/schools?limit=10&offset=0"),
		);

		expect(res.status).toBe(200);
		expect(res.body.data).toBeDefined();
	});

	// --- Negative ---

	it("returns 401 when x-api-key is missing", async () => {
		const res = await api().get("/api/schools");

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Unauthorized");
	});

	// --- Benchmark ---

	it("responds within the performance threshold", async () => {
		const { response, durationMs } = await measureResponseTime(
			"GET /api/schools",
			() => withApiKey(api().get("/api/schools")),
		);

		expect(response.status).toBe(200);
		expect(durationMs).toBeLessThan(RESPONSE_THRESHOLD_MS);
	});
});
