import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, parseBody, response } from "@/lib/http";
import { authMiddleware } from "@/middlewares/auth";
import type {
	DatabaseError,
	NotFoundError,
	ValidationError,
} from "@/services/errors/errors";
import { fetchQuizMaterials } from "@/services/quizzes";
import { quizMaterialsSchema } from "@/types/zod.api";

export const Route = createFileRoute("/api/(internal)/quiz/materials")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			POST: async ({ request }) =>
				Effect.runPromise(
					Effect.gen(function* () {
						const body = yield* Effect.tryPromise(() => request.json());
						const data = yield* parseBody(quizMaterialsSchema, body);

						const result = yield* fetchQuizMaterials(data.quiz_id);

						return response(
							{
								message: "Quiz materials fetched successfully",
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
											message: `${err.entity} with id ${err.id} not found`,
										},
										HttpStatus.NOT_FOUND,
									),
								),
							DatabaseError: (err: DatabaseError) =>
								Effect.succeed(
									response(
										{
											message: "Database error",
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
