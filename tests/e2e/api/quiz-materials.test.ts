import { beforeAll, describe, expect, it } from "vitest";
import {
	api,
	loginTestUser,
	measureResponseTime,
	withAuth,
	RESPONSE_THRESHOLD_MS,
} from "../helpers";

describe("POST /api/quiz/materials", () => {
	let token: string;
	let quizId: number;

	beforeAll(async () => {
		token = await loginTestUser();

		// Get a valid quiz ID from the first chapter
		const chaptersRes = await withAuth(api().get("/api/chapters"), token);
		const chapters = chaptersRes.body.data?.chapters;
		if (!chapters || chapters.length === 0) {
			throw new Error("[e2e] No chapters found");
		}

		const chapterRes = await withAuth(
			api().get(`/api/chapters/${chapters[0].id}`),
			token,
		);
		const quizzes = chapterRes.body.data?.quizzes;
		if (!quizzes || quizzes.length === 0) {
			throw new Error("[e2e] No quizzes found in first chapter");
		}
		quizId = quizzes[0].id;
	});

	// --- Positive ---

	it("returns materials for a valid quiz", async () => {
		const res = await withAuth(
			api().post("/api/quiz/materials"),
			token,
		).send({ quiz_id: quizId });

		expect(res.status).toBe(200);
		expect(res.body.message).toContain("successfully");
		expect(res.body.data).toBeDefined();
		expect(res.body.data.materials).toBeDefined();
		expect(Array.isArray(res.body.data.materials)).toBe(true);
	});

	// --- Negative ---

	it("returns 401 when bearer token is missing", async () => {
		const res = await api()
			.post("/api/quiz/materials")
			.send({ quiz_id: quizId });

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Unauthorized");
	});

	it("returns 400 for missing quiz_id", async () => {
		const res = await withAuth(
			api().post("/api/quiz/materials"),
			token,
		).send({});

		expect(res.status).toBe(400);
		expect(res.body.message).toContain("Validation failed");
	});

	it("returns 404 for non-existent quiz", async () => {
		const res = await withAuth(
			api().post("/api/quiz/materials"),
			token,
		).send({ quiz_id: 99999 });

		expect(res.status).toBe(404);
	});

	// --- Benchmark ---

	it("responds within the performance threshold", async () => {
		const { response, durationMs } = await measureResponseTime(
			"POST /api/quiz/materials",
			() =>
				withAuth(api().post("/api/quiz/materials"), token).send({
					quiz_id: quizId,
				}),
		);

		expect(response.status).toBe(200);
		expect(durationMs).toBeLessThan(RESPONSE_THRESHOLD_MS);
	});
});
