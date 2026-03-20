import { describe, expect, it } from "vitest";
import { api } from "../helpers";

describe("GET /api/health", () => {
	it("returns 200 with ok message", async () => {
		const res = await api().get("/api/health");

		expect(res.status).toBe(200);
		expect(res.body.message).toBe("server ok!");
	});
});
