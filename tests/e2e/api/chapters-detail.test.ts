import { beforeAll, describe, expect, it } from "vitest";
import {
	api,
	loginTestUser,
	measureResponseTime,
	withAuth,
	RESPONSE_THRESHOLD_MS,
} from "../helpers";

describe("GET /api/chapters/$id", () => {
	let token: string;
	let chapterId: number;

	beforeAll(async () => {
		token = await loginTestUser();

		// Fetch chapters list to get a valid chapter ID
		const res = await withAuth(api().get("/api/chapters"), token);
		const chapters = res.body.data?.chapters;
		if (!chapters || chapters.length === 0) {
			throw new Error("[e2e] No chapters found to test chapter detail");
		}
		chapterId = chapters[0].id;
	});

	// --- Positive ---

	it("returns chapter detail with quizzes", async () => {
		const res = await withAuth(
			api().get(`/api/chapters/${chapterId}`),
			token,
		);

		expect(res.status).toBe(200);
		expect(res.body.message).toContain("Successfully");
		expect(res.body.data).toBeDefined();
		expect(res.body.data.id).toBe(chapterId);
		expect(res.body.data.quizzes).toBeDefined();
		expect(Array.isArray(res.body.data.quizzes)).toBe(true);
	});

	// --- Negative ---

	it("returns 401 when bearer token is missing", async () => {
		const res = await api().get(`/api/chapters/${chapterId}`);

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Unauthorized");
	});

	it("returns 404 for non-existent chapter", async () => {
		const res = await withAuth(api().get("/api/chapters/99999"), token);

		expect(res.status).toBe(404);
	});

	it("returns 400 for invalid chapter id", async () => {
		const res = await withAuth(api().get("/api/chapters/abc"), token);

		expect(res.status).toBe(400);
		expect(res.body.message).toContain("Invalid");
	});

	// --- Benchmark ---

	it("responds within the performance threshold", async () => {
		const { response, durationMs } = await measureResponseTime(
			`GET /api/chapters/$id`,
			() => withAuth(api().get(`/api/chapters/${chapterId}`), token),
		);

		expect(response.status).toBe(200);
		expect(durationMs).toBeLessThan(RESPONSE_THRESHOLD_MS);
	});
});
