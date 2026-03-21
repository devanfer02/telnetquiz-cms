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
		expect(res.body.data).toHaveProperty("has_taken_pretest");
		expect(res.body.data).toHaveProperty("chapters");
		expect(Array.isArray(res.body.data.chapters)).toBe(true);

		const chapter = res.body.data.chapters[0];
		if (chapter) {
			expect(chapter).toHaveProperty("id");
			expect(chapter).toHaveProperty("title");
			expect(chapter).toHaveProperty("description");
			expect(chapter).toHaveProperty("mascot_id");
			expect(chapter).toHaveProperty("quiz_count");
			expect(chapter).toHaveProperty("completed_quizzes");
		}
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

	it("responds within the performance threshold", async () => {
		const { response, durationMs } = await measureResponseTime(
			"GET /api/chapters",
			() => withAuth(api().get("/api/chapters"), token),
		);

		expect(response.status).toBe(200);
		expect(durationMs).toBeLessThan(RESPONSE_THRESHOLD_MS);
	});
});
