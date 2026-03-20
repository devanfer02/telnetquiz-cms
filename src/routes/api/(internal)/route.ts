import { createFileRoute } from "@tanstack/react-router";
import { apiKeyMiddleware } from "@/middlewares/api-key";
import { loggerMiddleware } from "@/middlewares/logger";

export const Route = createFileRoute("/api/(internal)")({
	server: {
		middleware: [apiKeyMiddleware, loggerMiddleware],
	},
});
