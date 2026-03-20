import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
	],
	test: {
		root: resolve(import.meta.dirname ?? __dirname),
		include: ["tests/e2e/**/*.test.ts"],
		globalSetup: "./tests/e2e/global-setup.ts",
		testTimeout: 30_000,
		hookTimeout: 60_000,
	},
});
