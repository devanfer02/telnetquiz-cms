import "@/lib/sentry/server";
import { createFileRoute } from "@tanstack/react-router";
import { apiKeyMiddleware } from "@/middlewares/api-key";
import { loggerMiddleware } from "@/middlewares/logger";
import { sentryMiddleware } from "@/middlewares/sentry";

export const Route = createFileRoute("/api/(internal)")({
	server: {
		middleware: [sentryMiddleware, apiKeyMiddleware, loggerMiddleware],
	},
});
