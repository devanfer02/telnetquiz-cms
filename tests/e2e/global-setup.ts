const BASE_URL = "http://localhost:3000";
const HEALTH_ENDPOINT = `${BASE_URL}/api/health`;

const API_KEY = process.env.API_KEY;
const E2E_TEST_EMAIL = process.env.E2E_TEST_EMAIL;
const E2E_TEST_PASSWORD = process.env.E2E_TEST_PASSWORD;

if (!API_KEY || !E2E_TEST_EMAIL || !E2E_TEST_PASSWORD) {
	throw new Error(
		"[e2e] Missing critical environment variables: API_KEY, E2E_TEST_EMAIL, or E2E_TEST_PASSWORD. Please set them in your .env file.",
	);
}

async function isServerRunning(): Promise<boolean> {
	try {
		const res = await fetch(HEALTH_ENDPOINT);
		return res.ok;
	} catch {
		return false;
	}
}

async function registerTestUser(): Promise<void> {
	// Try login first — if it works, user already exists
	const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": API_KEY,
		},
		body: JSON.stringify({
			email: E2E_TEST_EMAIL,
			password: E2E_TEST_PASSWORD,
		}),
	});

	if (loginRes.ok) {
		console.log("[e2e] Test user already exists, skipping registration");
		return;
	}

	// Fetch a valid school_id
	const schoolsRes = await fetch(`${BASE_URL}/api/schools`, {
		headers: { "x-api-key": API_KEY },
	});
	const schoolsData = (await schoolsRes.json()) as {
		data: { schools: { id: number }[] };
	};
	const schoolId = schoolsData.data.schools[0]?.id;

	if (!schoolId) {
		throw new Error(
			"[e2e] No schools found to register test user. Ensure /api/schools returns data.",
		);
	}

	// Register the test user
	const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": API_KEY,
		},
		body: JSON.stringify({
			fullname: "E2E Test User",
			email: E2E_TEST_EMAIL,
			password: E2E_TEST_PASSWORD,
			school_id: schoolId,
			gender: true,
			grade: "10",
		}),
	});

	if (!registerRes.ok) {
		const body = await registerRes.text();
		throw new Error(
			`[e2e] Failed to register test user (${registerRes.status}): ${body}`,
		);
	}

	console.log("[e2e] Test user registered successfully");
}

export async function setup(): Promise<() => void> {
	if (!(await isServerRunning())) {
		throw new Error(
			"[e2e] Dev server is not running. Start it with `bun run dev` before running e2e tests.",
		);
	}

	console.log("[e2e] Dev server detected");
	await registerTestUser();

	return async () => {
		const { printSummary } = await import("./benchmark");
		printSummary();
	};
}
