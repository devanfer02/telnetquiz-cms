import { timingSafeEqual } from "node:crypto";
import { createMiddleware, json } from "@tanstack/react-start";
import { env } from "@/lib/env";
import { HttpStatus } from "@/lib/http";
export const apiKeyMiddleware = createMiddleware().server(
	async ({ request, next }) => {
		const providedKey = request.headers.get("x-api-key") ?? "";
		const expectedKey = env.API_KEY;

		if (!providedKey || !expectedKey) {
			throw json(
				{ message: "Unauthorized" },
				{ status: HttpStatus.UNAUTHORIZED },
			);
		}

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
