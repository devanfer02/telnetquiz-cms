import { readdir } from "node:fs/promises";
import { join } from "node:path";

const ROUTES_DIR = "src/routes/api";

async function getFiles(dir: string): Promise<string[]> {
	const dirents = await readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		dirents.map((dirent) => {
			const res = join(dir, dirent.name);
			return dirent.isDirectory() ? getFiles(res) : res;
		}),
	);
	return Array.prototype.concat(...files);
}

async function main() {
	try {
		const files = await getFiles(ROUTES_DIR);
		const routes = [];

		for (const file of files) {
			if (!file.endsWith(".ts")) continue;
			if (file.endsWith("route.ts")) continue; // Skip layout/middleware route files

			const content = await Bun.file(file).text();
			const methods = [];

			if (content.includes("GET:")) methods.push("GET");
			if (content.includes("POST:")) methods.push("POST");
			if (content.includes("PUT:")) methods.push("PUT");
			if (content.includes("PATCH:")) methods.push("PATCH");
			if (content.includes("DELETE:")) methods.push("DELETE");

			if (methods.length > 0) {
				// Normalize path
				let routePath = file
					.replace("src/routes", "")
					.replace(".ts", "")
					.replace("/index", "");

				// Handle dynamic routes (TanStack Router style)
				routePath = routePath.replace(/\$/g, "*");				
        // Fix windows path separators if running on windows (though user is on linux)
        routePath = routePath.replace(/\\/g, "/");
				routes.push({
					path: routePath,
					methods: methods.join(", "),
				});
			}
		}

		console.table(routes);
	} catch (error) {
		console.error("Error listing routes:", error);
	}
}

main();
