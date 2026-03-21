import { beforeAll, describe, expect, it } from "vitest";
import {
	api,
	loginTestUser,
	measureResponseTime,
	withApiKey,
	withAuth,
	RESPONSE_THRESHOLD_MS,
} from "../helpers";

describe("GET /api/pretest", () => {
	// --- Positive ---

	it("returns pretest questions", async () => {
		const res = await withApiKey(api().get("/api/pretest"));

		expect(res.status).toBe(200);
		expect(res.body.message).toContain("Successfully");
		expect(res.body.data).toBeDefined();
		expect(res.body.data.questions).toBeDefined();
	});

	// --- Negative ---

	it("returns 401 when x-api-key is missing", async () => {
		const res = await api().get("/api/pretest");

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Unauthorized");
	});

	// --- Benchmark ---

	it("responds within the performance threshold", async () => {
		const { response, durationMs } = await measureResponseTime(
			"GET /api/pretest",
			() => withApiKey(api().get("/api/pretest")),
		);

		expect(response.status).toBe(200);
		expect(durationMs).toBeLessThan(RESPONSE_THRESHOLD_MS);
	});
});

describe("POST /api/pretest", () => {
	let token: string;

	beforeAll(async () => {
		token = await loginTestUser();
	});

	// --- Negative ---

	it("returns 401 when x-api-key is missing", async () => {
		const res = await api().post("/api/pretest").send({
			pretest_submissions: [],
		});

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Unauthorized");
	});

	it("returns 401 when bearer token is missing", async () => {
		const res = await withApiKey(api().post("/api/pretest")).send({
			pretest_submissions: [],
		});

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Unauthorized");
	});

	it("returns 400 for invalid body", async () => {
		const res = await withAuth(api().post("/api/pretest"), token).send({});

		expect(res.status).toBe(400);
		expect(res.body.message).toContain("Validation failed");
	});
});
