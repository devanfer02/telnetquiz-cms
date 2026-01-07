import { apiKeyMiddleware } from "@/middlewares/api-key";
import { loggerMiddleware } from "@/middlewares/logger";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/(internal)")({
	server: {
		middleware: [apiKeyMiddleware, loggerMiddleware],
	},
});
