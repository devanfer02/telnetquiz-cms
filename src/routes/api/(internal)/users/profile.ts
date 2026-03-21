import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, parseBody, response } from "@/lib/http";
import { withApiErrorHandling } from "@/lib/sentry/effect";
import { authMiddleware } from "@/middlewares/auth";
import { fetchUserProfile, updateUserProfile } from "@/services/users";
import { updateProfileSchema } from "@/types/zod.api";

export const Route = createFileRoute("/api/(internal)/users/profile")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			GET: async ({ context }) =>
				Effect.runPromise(
					withApiErrorHandling(
						Effect.gen(function* () {
							const result = yield* fetchUserProfile(context.user.id);

							return response(
								{
									message: "Successfully fetch user profile",
									data: result,
								},
								HttpStatus.OK,
							);
						}).pipe(Effect.provide(DbLayer)),
					),
				),
			PATCH: async ({ request, context }) =>
				Effect.runPromise(
					withApiErrorHandling(
						Effect.gen(function* () {
							const body = yield* Effect.tryPromise(() => request.json());
							const data = yield* parseBody(updateProfileSchema, body);

							const result = yield* updateUserProfile(context.user.id, data);

							return response(
								{
									message: "Successfully updated user profile",
									data: result,
								},
								HttpStatus.OK,
							);
						}).pipe(Effect.provide(DbLayer)),
					),
				),
		},
	},
});
