import * as Sentry from "@sentry/node";
import { createMiddleware } from "@tanstack/react-start";

export const sentryMiddleware = createMiddleware().server(
	async ({ request, next }) => {
		const url = new URL(request.url);
		return Sentry.startSpan(
			{
				op: "http.server",
				name: `${request.method} ${url.pathname}`,
				attributes: {
					"http.method": request.method,
					"http.url": url.pathname,
					"http.query": url.search,
				},
			},
			async (span) => {
				const result = await next();
				const status = result?.response?.status;
				if (status) {
					span.setAttributes({ "http.status_code": status });
					if (status >= 500) span.setStatus({ code: 2 });
				}
				return result;
			},
		);
	},
);
