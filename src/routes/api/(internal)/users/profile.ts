import { DbLayer } from "@/lib/db";
import { HttpStatus, parseBody, response } from "@/lib/http";
import { authMiddleware } from "@/middlewares/auth";
import {
	DatabaseError,
	NotFoundError,
	ValidationError,
} from "@/services/errors/errors";
import { fetchUserProfile, updateUserProfile } from "@/services/users";
import { updateProfileSchema } from "@/types/zod.api";
import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";

export const Route = createFileRoute("/api/(internal)/users/profile")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			GET: async ({ context }) =>
				Effect.runPromise(
					Effect.gen(function* () {
						const result = yield* fetchUserProfile(context.user.id);

						return response(
							{
								message: "Successfully fetch user profile",
								data: result,
							},
							HttpStatus.OK,
						);
					}).pipe(
						Effect.provide(DbLayer),
						Effect.catchTags({
							NotFoundError: (err: NotFoundError) =>
								Effect.succeed(
									response(
										{
											message: `${err.entity} not found`,
										},
										HttpStatus.NOT_FOUND,
									),
								),
							DatabaseError: (err: DatabaseError) =>
								Effect.succeed(
									response(
										{
											message: "Failed to fetch user profile",
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
									{
										message: "Internal server error",
									},
									HttpStatus.INTERNAL_SERVER_ERROR,
								),
							);
						}),
					),
				),
			PATCH: async ({ request, context }) =>
				Effect.runPromise(
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
					}).pipe(
						Effect.provide(DbLayer),
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
							NotFoundError: (err: NotFoundError) =>
								Effect.succeed(
									response(
										{
											message: `${err.entity} not found`,
										},
										HttpStatus.NOT_FOUND,
									),
								),
							DatabaseError: (err: DatabaseError) =>
								Effect.succeed(
									response(
										{
											message: "Failed to update user profile",
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
									{
										message: "Internal server error",
									},
									HttpStatus.INTERNAL_SERVER_ERROR,
								),
							);
						}),
					),
				),
		},
	},
});
