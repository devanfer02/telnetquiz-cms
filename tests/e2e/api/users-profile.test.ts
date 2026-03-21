import { beforeAll, describe, expect, it } from "vitest";
import {
	api,
	loginTestUser,
	measureResponseTime,
	withApiKey,
	withAuth,
	RESPONSE_THRESHOLD_MS,
} from "../helpers";

describe("GET /api/users/profile", () => {
	let token: string;

	beforeAll(async () => {
		token = await loginTestUser();
	});

	// --- Positive ---

	it("returns user profile data", async () => {
		const res = await withAuth(api().get("/api/users/profile"), token);

		expect(res.status).toBe(200);
		expect(res.body.message).toContain("Successfully");
		expect(res.body.data).toBeDefined();
		expect(res.body.data).toHaveProperty("id");
		expect(res.body.data).toHaveProperty("fullname");
		expect(res.body.data).toHaveProperty("email");
		expect(res.body.data).toHaveProperty("image");
		expect(res.body.data).toHaveProperty("bio");
		expect(res.body.data).toHaveProperty("gender");
		expect(res.body.data).toHaveProperty("grade");
		expect(res.body.data).toHaveProperty("school");
		expect(res.body.data).toHaveProperty("stats");
		expect(res.body.data.stats).toHaveProperty("total_score");
		expect(res.body.data.stats).toHaveProperty("levels_completed");
		expect(res.body.data.stats).toHaveProperty("chapters_completed");
		expect(res.body.data.stats).toHaveProperty("total_chapters");
		expect(res.body.data.stats).toHaveProperty("daily_streak");
	});

	// --- Negative ---

	it("returns 401 when x-api-key is missing", async () => {
		const res = await api().get("/api/users/profile");

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Unauthorized");
	});

	it("returns 401 when bearer token is missing", async () => {
		const res = await withApiKey(api().get("/api/users/profile"));

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Unauthorized");
	});

	it("returns 401 when bearer token is invalid", async () => {
		const res = await withAuth(
			api().get("/api/users/profile"),
			"invalid-token",
		);

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Unauthorized");
	});

	// --- Benchmark ---

	it("responds within the performance threshold", async () => {
		const { response, durationMs } = await measureResponseTime(
			"GET /api/users/profile",
			() => withAuth(api().get("/api/users/profile"), token),
		);

		expect(response.status).toBe(200);
		expect(durationMs).toBeLessThan(RESPONSE_THRESHOLD_MS);
	});
});

describe("PATCH /api/users/profile", () => {
	let token: string;

	beforeAll(async () => {
		token = await loginTestUser();
	});

	// --- Positive ---

	it("updates user profile successfully", async () => {
		const res = await withAuth(api().patch("/api/users/profile"), token).send({
			fullname: "E2E Test User",
		});

		expect(res.status).toBe(200);
		expect(res.body.message).toContain("Successfully");
		expect(res.body.data).toBeDefined();
		expect(res.body.data).toHaveProperty("id");
		expect(res.body.data).toHaveProperty("fullname");
		expect(res.body.data.fullname).toBe("E2E Test User");
		expect(res.body.data).toHaveProperty("email");
		expect(res.body.data).toHaveProperty("stats");
		expect(res.body.data.stats).toHaveProperty("total_score");
		expect(res.body.data.stats).toHaveProperty("levels_completed");
	});

	// --- Negative ---

	it("returns 401 when x-api-key is missing", async () => {
		const res = await api().patch("/api/users/profile").send({
			fullname: "Test",
		});

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Unauthorized");
	});

	it("returns 401 when bearer token is missing", async () => {
		const res = await withApiKey(api().patch("/api/users/profile")).send({
			fullname: "Test",
		});

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Unauthorized");
	});

	it("returns 400 for invalid body", async () => {
		const res = await withAuth(api().patch("/api/users/profile"), token).send({
			fullname: "ab",
		});

		expect(res.status).toBe(400);
	});

	// --- Benchmark ---

	it("responds within the performance threshold", async () => {
		const { response, durationMs } = await measureResponseTime(
			"PATCH /api/users/profile",
			() => withAuth(api().patch("/api/users/profile"), token).send({
				fullname: "E2E Test User",
			}),
		);

		expect(response.status).toBe(200);
		expect(durationMs).toBeLessThan(RESPONSE_THRESHOLD_MS);
	});
});
