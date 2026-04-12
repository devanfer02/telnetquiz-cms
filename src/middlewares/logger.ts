import * as Sentry from "@sentry/node";
import { createMiddleware } from "@tanstack/react-start";
import pino from "pino";

const logger = pino({
	level: process.env.NODE_ENV === "production" ? "info" : "debug",
});

export const loggerMiddleware = createMiddleware().server(
	async ({ request, next }) => {
		const startTime = Date.now();
		const url = new URL(request.url);

		const reqData = {
			method: request.method,
			path: url.pathname,
			query: url.search || undefined,
			ip:
				request.headers.get("cf-connecting-ip") ||
				request.headers.get("x-real-ip") ||
				request.headers.get("x-forwarded-for")?.split(",")[0] ||
				undefined,
			userAgent: request.headers.get("user-agent") || undefined,
		};

		try {
			const response = await next();
			const duration = Date.now() - startTime;
			const data = {
				...reqData,
				statusCode: response.response.status,
				duration,
			};

			logger.info(
				data,
				`${reqData.method} ${reqData.path} ${response.response.status} ${duration}ms`,
			);
			Sentry.logger.info("API Request Triggered", {
				...reqData,
				statusCode: response.response.status,
				duration,
			});

			return response;
		} catch (error) {
			const duration = Date.now() - startTime;

			logger.error(
				{ ...reqData, err: error, duration },
				`${reqData.method} ${reqData.path} ERROR ${duration}ms`,
			);

			Sentry.captureException(error, {
				extra: { ...reqData, duration },
			});

			throw error;
		}
	},
);
