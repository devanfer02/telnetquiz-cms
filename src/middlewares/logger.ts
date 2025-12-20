import { createMiddleware } from "@tanstack/react-start";

export const loggerMiddleware = createMiddleware().server(
	async ({ request, next }) => {
		// only logs api request
		if (!request.url.includes("/api")) {
			return next();
		}

		const startTime = Date.now();
		const url = new URL(request.url);

		const logData = {
			timestamp: new Date().toISOString(),
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

			console.log(
				JSON.stringify({
					...logData,
					statusCode: response.response.status || "unknown",
					duration: `${duration}ms`,
				}),
			);

			return response;
		} catch (error) {
			const duration = Date.now() - startTime;

			console.error(
				"Error:",
				JSON.stringify({
					...logData,
					error: String(error),
					duration: `${duration}ms`,
				}),
			);

			throw error;
		}
	},
);
