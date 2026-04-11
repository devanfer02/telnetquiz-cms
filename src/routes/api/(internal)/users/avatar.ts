import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, response } from "@/lib/http";
import { S3Layer } from "@/lib/s3";
import { withApiErrorHandling } from "@/lib/sentry/effect";
import { authMiddleware } from "@/middlewares/auth";
import { ValidationError } from "@/services/errors/errors";
import { uploadAvatar } from "@/services/users/avatar";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export const Route = createFileRoute("/api/(internal)/users/avatar")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			POST: async ({ request }) =>
				Effect.runPromise(
					withApiErrorHandling(
						Effect.gen(function* () {
							const formData = yield* Effect.tryPromise({
								try: () => request.formData(),
								catch: () =>
									new ValidationError({
										errors: { form: "Invalid form data" },
									}),
							});

							const file = formData.get("image");
							if (!file || !(file instanceof File)) {
								return yield* Effect.fail(
									new ValidationError({
										errors: { image: "No image file provided" },
									}),
								);
							}

							if (file.size > MAX_FILE_SIZE) {
								return yield* Effect.fail(
									new ValidationError({
										errors: { image: "File size exceeds 2MB limit" },
									}),
								);
							}

							if (!ALLOWED_TYPES.includes(file.type)) {
								return yield* Effect.fail(
									new ValidationError({
										errors: {
											image:
												"Invalid file type. Only JPG, JPEG, and PNG are allowed",
										},
									}),
								);
							}

							const imageUrl = yield* uploadAvatar(file);

							return response(
								{
									message: "Successfully uploaded avatar",
									data: { image_url: imageUrl },
								},
								HttpStatus.OK,
							);
						}).pipe(Effect.provide(S3Layer), Effect.provide(DbLayer)),
					),
				),
		},
	},
});
