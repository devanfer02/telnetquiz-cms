import request, { type Response, type Test } from "supertest";
import { recordBenchmark } from "./benchmark";

const BASE_URL = "http://localhost:3000";

export const RESPONSE_THRESHOLD_MS = 1000;

const API_KEY = process.env.API_KEY ?? "";
const E2E_TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? "";
const E2E_TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "";

/**
 * Creates a supertest agent targeting the dev server.
 */
export function api(): request.Agent {
	return request(BASE_URL);
}

/**
 * Sets the `x-api-key` header on a supertest request.
 */
export function withApiKey(req: Test): Test {
	return req.set("x-api-key", API_KEY);
}

/**
 * Sets both `x-api-key` and `Authorization: Bearer <token>` headers.
 */
export function withAuth(req: Test, token: string): Test {
	return req.set("x-api-key", API_KEY).set("Authorization", `Bearer ${token}`);
}

/**
 * Logs in with E2E test credentials and returns a bearer token.
 * Throws if login fails.
 */
export async function loginTestUser(): Promise<string> {
	const res: Response = await withApiKey(api().post("/api/auth/login")).send({
		email: E2E_TEST_EMAIL,
		password: E2E_TEST_PASSWORD,
	});

	if (res.status !== 200 || !res.body.token) {
		throw new Error(
			`loginTestUser failed (status ${res.status}): ${JSON.stringify(res.body)}`,
		);
	}

	return res.body.token as string;
}

/**
 * Measures response time of a supertest request.
 * Returns `{ response, durationMs }`.
 */
export async function measureResponseTime(
	endpoint: string,
	requestFn: () => Test,
): Promise<{ response: Response; durationMs: number }> {
	const start = performance.now();
	const response = await requestFn();
	const durationMs = Math.round(performance.now() - start);
	recordBenchmark(endpoint, durationMs);
	return { response, durationMs };
}
