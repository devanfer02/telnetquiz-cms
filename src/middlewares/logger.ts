import { createMiddleware } from "@tanstack/react-start";
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const fileTransport = new DailyRotateFile({
	filename: "logs/%DATE%.log",
	datePattern: "YYYY-MM-DD",
	maxFiles: "7d",
	format: format.combine(format.timestamp(), format.json()),
});

const logger = createLogger({
	level: "info",
	transports: [
		new transports.Console({
			format: format.combine(format.timestamp(), format.json()),
		}),
		fileTransport,
	],
});

export const loggerMiddleware = createMiddleware().server(
	async ({ request, next }) => {
		const startTime = Date.now();
		const url = new URL(request.url);

		const logData = {
			method: request.method,
			path: url.pathname,
			query: url.search,
			ip:
				request.headers.get("cf-connecting-ip") ||
				request.headers.get("x-real-ip") ||
				request.headers.get("x-forwarded-for")?.split(",")[0] ||
				"unknown",
			userAgent: request.headers.get("user-agent") || "unknown",
			referer: request.headers.get("referer") || "direct",
			host: request.headers.get("host") || "unknown",
			contentType: request.headers.get("content-type"),
		};

		try {
			const response = await next();
			const duration = Date.now() - startTime;

			logger.info({
				...logData,
				statusCode: response.response.status || "unknown",
				duration: `${duration}ms`,
			});

			return response;
		} catch (error) {
			const duration = Date.now() - startTime;

			logger.error({
				...logData,
				error: String(error),
				duration: `${duration}ms`,
			});

			throw error;
		}
	},
);
