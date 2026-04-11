import { createMiddleware } from "@tanstack/react-start";

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

			console.info(
				JSON.stringify({
					...logData,
					statusCode: response.response.status || "unknown",
					duration: `${duration}ms`,
					timestamp: new Date().toISOString(),
				}),
			);

			return response;
		} catch (error) {
			const duration = Date.now() - startTime;

			console.error(
				JSON.stringify({
					...logData,
					error: String(error),
					duration: `${duration}ms`,
					timestamp: new Date().toISOString(),
				}),
			);

			throw error;
		}
	},
);
