import { json } from "@tanstack/react-start";
import { Effect } from "effect";
import z from "zod";
import { ValidationError } from "@/services/errors/errors";

export const parseNumericId = (raw: string, label = "id") =>
	Effect.gen(function* () {
		const id = Number(raw);
		if (Number.isNaN(id)) {
			return yield* Effect.fail(
				new ValidationError({ errors: { [label]: `Invalid ${label}` } }),
			);
		}
		return id;
	});

export const HttpStatus = {
	OK: 200,
	CREATED: 201,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	INTERNAL_SERVER_ERROR: 500,
	BAD_GATEWAY: 502,
} as const;

export const parseBody = <T>(schema: z.ZodSchema<T>, body: unknown) =>
	Effect.try({
		try: () => schema.parse(body),
		catch: (err) => {
			if (err instanceof z.ZodError) {
				return new ValidationError({
					errors: z.flattenError(err).fieldErrors,
				});
			}
			return err;
		},
	});

export const response = (data: Record<string, any>, statusCode: number) => {
	return json(data, {
		status: statusCode,
	});
};
