---
name: e2e-test
description: E2E API testing patterns with Supertest against TanStack Start + Nitro. Use when writing or modifying API integration tests.
user-invocable: false
---

# E2E API Testing Reference

## Why Supertest + URL-based Testing

TanStack Start + Nitro doesn't expose an Express `app` object. Tests target a running dev server via URL (`http://localhost:3000`), not by importing the app. The global setup handles server lifecycle automatically.

## Project Structure

```
telnetquiz-cms/
├── vitest.config.e2e.ts          # Standalone config (no TanStack/Nitro/React plugins)
├── tests/e2e/
│   ├── global-setup.ts           # Server detection + test user registration
│   ├── helpers.ts                # Request factory + auth utilities
│   └── api/                      # All test files go here
│       ├── health.test.ts
│       ├── chapters.test.ts
│       ├── achievements.test.ts
│       ├── users-profile.test.ts
│       ├── pretest.test.ts
│       ├── leaderboard.test.ts
│       ├── quiz.test.ts
│       └── schools.test.ts
```

Run tests: `bun run test:e2e`

## Test File Template

```typescript
import { beforeAll, describe, expect, it } from "vitest";
import {
  api, loginTestUser, withApiKey, withAuth,
  measureResponseTime, RESPONSE_THRESHOLD_MS,
} from "../helpers";

describe("METHOD /api/route-path", () => {
  let token: string;

  beforeAll(async () => {
    token = await loginTestUser();
  });

  // --- Positive ---
  it("description of happy path", async () => {
    const res = await withAuth(api().get("/api/route-path"), token);
    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Successfully");
    expect(res.body.data).toBeDefined();
  });

  // --- Negative ---
  it("returns 401 when x-api-key is missing", async () => {
    const res = await api().get("/api/route-path");
    expect(res.status).toBe(401);
  });

  it("returns 401 when bearer token is missing", async () => {
    const res = await withApiKey(api().get("/api/route-path"));
    expect(res.status).toBe(401);
  });

  it("returns 401 when bearer token is invalid", async () => {
    const res = await withAuth(api().get("/api/route-path"), "invalid-token");
    expect(res.status).toBe(401);
  });

  // --- Benchmark ---
  it("responds within threshold", async () => {
    const { response, durationMs } = await measureResponseTime(
      "GET /api/route-path",
      () => withAuth(api().get("/api/route-path"), token),
    );
    expect(response.status).toBe(200);
    expect(durationMs).toBeLessThan(RESPONSE_THRESHOLD_MS);
  });
});
```

## Auth Patterns

All `/api/(internal)/*` routes require the `x-api-key` header. Some also require a Bearer token (session).

| Helper | When to use |
|--------|-------------|
| `withApiKey(req)` | Routes needing only API key (e.g. `/api/pretest` GET, `/api/schools`) |
| `withAuth(req, token)` | Routes needing API key + user session (e.g. `/api/chapters`, `/api/achievements`) |
| `loginTestUser()` | Call in `beforeAll` to get a Bearer token for auth-protected tests |

Auth env vars (`E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD`) must be set in `.env` — these should be real credentials for a test user in the database.

## POST Request Pattern

```typescript
it("submits data successfully", async () => {
  const res = await withAuth(api().post("/api/route-path"), token)
    .send({
      field_one: "value",     // snake_case — API schemas use snake_case
      field_two: 123,
    });

  expect(res.status).toBe(200);
  expect(res.body.data).toBeDefined();
});

it("returns 400 for invalid body", async () => {
  const res = await withAuth(api().post("/api/route-path"), token)
    .send({});

  expect(res.status).toBe(400);
  expect(res.body.message).toContain("Validation failed");
});
```

## Routes Worth Testing

Criteria: **≥3 DB calls** or **≥2 service calls** — these have the most integration surface.

| Route | Method | Auth | Complexity |
|-------|--------|------|------------|
| `/api/achievements` | GET | api-key + bearer | 6 DB calls |
| `/api/chapters` | GET | api-key + bearer | 4 DB calls |
| `/api/users/profile` | GET | api-key + bearer | 4 DB calls |
| `/api/users/profile` | PATCH | api-key + bearer | 2 services |
| `/api/pretest` | GET | api-key only | 2 services |
| `/api/pretest` | POST | api-key + bearer | 4 DB calls |
| `/api/leaderboard` | GET | api-key + bearer | 3 DB calls |
| `/api/quiz/$id` | POST | api-key + bearer | 2 services |
| `/api/schools` | GET | api-key only | 2 services |

## Benchmark Guidelines

All API endpoints must respond within **1000ms**. This is enforced by the `RESPONSE_THRESHOLD_MS` constant exported from `helpers.ts`. Every benchmark test must use this constant — never hardcode a threshold.

```typescript
import { RESPONSE_THRESHOLD_MS } from "../helpers";

expect(durationMs).toBeLessThan(RESPONSE_THRESHOLD_MS);
```

## Response Shape Convention

All API responses follow: `{ message: string, data?: unknown, error?: string, errors?: unknown }`

Common status codes: `200` (success), `201` (created), `400` (validation), `401` (unauthorized), `404` (not found), `500` (server error).

## Gotchas

- **Always start the dev server manually before running `bun run test:e2e`.** The global setup does NOT spawn a server — it will throw if no server is detected at `http://localhost:3000`. Run `bun run dev` in a separate terminal first.
- **The global setup registers a test user automatically.** It tries to login with `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` first; if that fails, it registers a new user via `/api/auth/register`. This means `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD` must be set in `.env`.

## Vitest Config Notes

The e2e config (`vitest.config.e2e.ts`) is intentionally separate from the main vite config:
- **No** TanStack Start, Nitro, React, Tailwind, or auto-import plugins
- **Only** `vite-tsconfig-paths` for `@/` alias resolution
- `testTimeout: 30s`, `hookTimeout: 60s` — network requests need longer timeouts
- `globalSetup` handles dev server start/stop automatically
