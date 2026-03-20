import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, response } from "@/lib/http";
import { S3Layer } from "@/lib/s3";
import { authMiddleware } from "@/middlewares/auth";
import { uploadAvatar } from "@/services/avatar";
import type { DatabaseError } from "@/services/errors/errors";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export const Route = createFileRoute("/api/(internal)/users/avatar")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			POST: async ({ request }) =>
				Effect.runPromise(
					Effect.gen(function* () {
						const formData = yield* Effect.tryPromise({
							try: () => request.formData(),
							catch: () => ({
								_tag: "ValidationError" as const,
								message: "Invalid form data",
							}),
						});

						const file = formData.get("image");
						if (!file || !(file instanceof File)) {
							return response(
								{ message: "No image file provided" },
								HttpStatus.BAD_REQUEST,
							);
						}

						if (file.size > MAX_FILE_SIZE) {
							return response(
								{ message: "File size exceeds 2MB limit" },
								HttpStatus.BAD_REQUEST,
							);
						}

						if (!ALLOWED_TYPES.includes(file.type)) {
							return response(
								{
									message:
										"Invalid file type. Only JPG, JPEG, and PNG are allowed",
								},
								HttpStatus.BAD_REQUEST,
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
					}).pipe(
						Effect.provide(S3Layer),
						Effect.provide(DbLayer),
						Effect.catchTags({
							DatabaseError: (err: DatabaseError) =>
								Effect.succeed(
									response(
										{
											message: "Failed to upload avatar",
											error: err.message,
										},
										HttpStatus.INTERNAL_SERVER_ERROR,
									),
								),
						}),
						Effect.catchAll((err) => {
							console.error("ERR: ", err);
							return Effect.succeed(
								response(
									{ message: "Internal server error" },
									HttpStatus.INTERNAL_SERVER_ERROR,
								),
							);
						}),
					),
				),
		},
	},
});
