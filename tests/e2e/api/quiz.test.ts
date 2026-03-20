import { beforeAll, describe, expect, it } from "vitest";
import { api, loginTestUser, withApiKey, withAuth } from "../helpers";

describe("POST /api/quiz/$id", () => {
	let token: string;

	beforeAll(async () => {
		token = await loginTestUser();
	});

	// --- Negative ---

	it("returns 401 when x-api-key is missing", async () => {
		const res = await api().post("/api/quiz/1").send({
			answers: [],
		});

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Unauthorized");
	});

	it("returns 401 when bearer token is missing", async () => {
		const res = await withApiKey(api().post("/api/quiz/1")).send({
			answers: [],
		});

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Unauthorized");
	});

	it("returns 401 when bearer token is invalid", async () => {
		const res = await withAuth(api().post("/api/quiz/1"), "invalid-token").send(
			{
				answers: [],
			},
		);

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Unauthorized");
	});

	it("returns 400 for invalid quiz id", async () => {
		const res = await withAuth(
			api().post("/api/quiz/notanumber"),
			token,
		).send({
			answers: [],
		});

		expect(res.status).toBe(400);
		expect(res.body.message).toContain("Invalid");
	});

	it("returns 400 for invalid body", async () => {
		const res = await withAuth(api().post("/api/quiz/1"), token).send({});

		expect(res.status).toBe(400);
	});
});
