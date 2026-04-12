import * as Sentry from "@sentry/node";
import { Effect } from "effect";
import { HttpStatus, response } from "@/lib/http";
import type {
	AuthError,
	CloudflareR2Error,
	DatabaseError,
	InternalServerError,
	NotFoundError,
	TtsServiceError,
	ValidationError,
} from "@/services/errors/errors";

type AppError =
	| ValidationError
	| NotFoundError
	| AuthError
	| DatabaseError
	| CloudflareR2Error
	| InternalServerError
	| TtsServiceError;

export const withApiErrorHandling = <A>(
	effect: Effect.Effect<A, AppError, never>,
) =>
	effect.pipe(
		Effect.catchTags({
			ValidationError: (err: ValidationError) =>
				Effect.succeed(
					response(
						{
							message: "Validation failed",
							error: err.errors,
						},
						HttpStatus.BAD_REQUEST,
					),
				),
			NotFoundError: (_err: NotFoundError) =>
				Effect.succeed(
					response(
						{
							message: "Resource not found",
						},
						HttpStatus.NOT_FOUND,
					),
				),
			AuthError: (err: AuthError) =>
				Effect.succeed(
					response(
						{
							message: err.message,
						},
						HttpStatus.UNAUTHORIZED,
					),
				),
			DatabaseError: (err: DatabaseError) => {
				Sentry.captureException(err.cause);
				return Effect.succeed(
					response(
						{
							message: "An internal error occurred",
						},
						HttpStatus.INTERNAL_SERVER_ERROR,
					),
				);
			},
			CloudflareR2Error: (err: CloudflareR2Error) => {
				Sentry.captureException(err.cause);
				return Effect.succeed(
					response(
						{
							message: "An internal error occurred",
						},
						HttpStatus.INTERNAL_SERVER_ERROR,
					),
				);
			},
			InternalServerError: (err: InternalServerError) => {
				Sentry.captureException(err.cause);
				return Effect.succeed(
					response(
						{
							message: "An internal error occurred",
						},
						HttpStatus.INTERNAL_SERVER_ERROR,
					),
				);
			},
			TtsServiceError: (err: TtsServiceError) => {
				Sentry.captureException(err.cause);
				return Effect.succeed(
					response(
						{
							message: "An internal error occurred",
						},
						HttpStatus.BAD_GATEWAY,
					),
				);
			},
		}),
		Effect.catchAll((err) => {
			Sentry.captureException(
				// @ts-expect-error
				err instanceof Error ? err : new Error(String(err)),
			);
			console.error("ERR: ", err);
			return Effect.succeed(
				response(
					{
						message: "Internal server error",
					},
					HttpStatus.INTERNAL_SERVER_ERROR,
				),
			);
		}),
	);
