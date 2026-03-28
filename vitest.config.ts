import { defineConfig } from "vitest/config";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		viteReact(),
	],
	test: {
		environment: "jsdom",
		include: ["src/**/*.test.{ts,tsx}"],
		exclude: ["tests/e2e/**", "node_modules/**"],
		coverage: {
			provider: "v8",
			reporter: ["text", "text-summary", "lcov"],
			include: [
				"src/lib/**/*.{ts,tsx}",
				"src/services/errors/**/*.ts",
			],
			exclude: [
				"src/lib/auth/**",
				"src/lib/sentry/**",
				"src/lib/db.ts",
				"src/lib/env.ts",
				"src/lib/s3.ts",
				"src/lib/devtools.tsx",
				"src/lib/query-client.ts",
				"src/lib/http.ts",
				"src/lib/retry.ts",
			],
			thresholds: {
				lines: 90,
				functions: 90,
				branches: 90,
				statements: 90,
			},
		},
	},
});
