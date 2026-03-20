import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, response } from "@/lib/http";
import type { DatabaseError } from "@/services/errors/errors";
import { fetchQuestionsByType } from "@/services/questions";

export const Route = createFileRoute("/api/(internal)/questions")({
	server: {
		handlers: {
			GET: ({ request }) =>
				Effect.runPromise(
					Effect.gen(function* () {
						const url = new URL(request.url);
						const type = url.searchParams.get("type");

						if (!type || (type !== "pretest" && type !== "quiz")) {
							return response(
								{
									message: "Invalid or missing type search params",
								},
								HttpStatus.BAD_REQUEST,
							);
						}

						const questions = yield* fetchQuestionsByType(type);

						const formattedQuestions = questions.map((q) => ({
							id: q.id,
							type: q.type,
							chapter_id: q.chapterId,
							image_link: q.imageLink,
							description: q.description,
							question: q.question,
							options: q.options.map((o) => ({
								id: o.id,
								text: o.text,
							})),
						}));

						return response(
							{
								message: "Successfully fetch questions",
								data: {
									questions: formattedQuestions,
								},
							},
							HttpStatus.OK,
						);
					}).pipe(
						Effect.provide(DbLayer),
						Effect.catchTags({
							DatabaseError: (err: DatabaseError) =>
								Effect.succeed(
									response(
										{
											message: "Failed to fetch questions",
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
