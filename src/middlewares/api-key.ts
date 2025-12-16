import { env } from "@/lib/env";
import { HttpStatus } from "@/lib/http";
import { createMiddleware, json } from "@tanstack/react-start";
import { timingSafeEqual } from "crypto";
export const apiKeyMiddleware = createMiddleware().server(
	async ({ request, next }) => {
		const providedKey = request.headers.get("x-api-key") ?? "";
		const expectedKey = env.API_KEY;

		const providedKeyBuffer = Buffer.from(providedKey);
		const expectedKeyBuffer = Buffer.from(expectedKey);

		if (
			providedKeyBuffer.length !== expectedKeyBuffer.length ||
			!timingSafeEqual(providedKeyBuffer, expectedKeyBuffer)
		) {
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
