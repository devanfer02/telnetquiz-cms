import { env } from "@/lib/env";
import { HttpStatus } from "@/lib/http";
import { createMiddleware, json } from "@tanstack/react-start";

export const apiKeyMiddleware = createMiddleware().server(
	async ({ request, next }) => {
		const apiKey = request.headers.get("x-api-key");

		if (apiKey === null || apiKey !== env.API_KEY) {
			throw json(
				{
					message: "Unauthorized",
				},
				{ status: HttpStatus.UNAUTHORIZED },
			);
		}

		return next();
	},
);
