import { options, questions } from "@/database/schema";
import { Db } from "@/lib/db";
import type { QuestionsFormData } from "@/types/zod";
import { desc } from "drizzle-orm";
import { Effect } from "effect";
import { DatabaseError } from "./errors/errors";
import { uploadFile } from "./image";

export const fetchAllQuestions = Effect.gen(function* () {
	const { db } = yield* Db;

	return yield* Effect.tryPromise({
		try: () => db.select().from(questions).orderBy(desc(questions.createdAt)),
		catch: (err) =>
			new DatabaseError({
				cause: err,
				message: "Failed to fetch questions",
			}),
	});
});

export const createQuestionsService = (data: QuestionsFormData) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const questionsWithImages = yield* Effect.all(
			data.questions.map((q) =>
				Effect.gen(function* () {
					let imageLink: string | null = null;
					if (q.image instanceof File) {
						imageLink = yield* uploadFile(q.image);
					}
					return { ...q, imageLink };
				}),
			),
			{ concurrency: 5 },
		);

		yield* Effect.tryPromise({
			try: () =>
				db.transaction(async (tx) => {
					if (questionsWithImages.length === 0) return;

					const insertedQuestions = await tx
						.insert(questions)
						.values(
							questionsWithImages.map((q) => ({
								quizId: data.quizId,
								materialId: data.materialId,
								description: q.description,
								question: q.question,
								imageLink: q.imageLink,
							})),
						)
						.returning();

					const allOptions = insertedQuestions.flatMap((iq, index) => {
						const originalQ = questionsWithImages[index];
						return originalQ.options.map((opt) => ({
							questionId: iq.id,
							text: opt.text,
							isCorrect: opt.isCorrect,
						}));
					});

					if (allOptions.length > 0) {
						await tx.insert(options).values(allOptions);
					}
				}),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: "Failed to create questions",
				}),
		});
	});
