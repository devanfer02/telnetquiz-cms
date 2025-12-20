import { options, questions } from "@/database/schema";
import { Db } from "@/lib/db";
import type { QuestionFormData, QuestionsFormData } from "@/types/zod";
import { desc, eq } from "drizzle-orm";
import { Effect } from "effect";
import { DatabaseError, NotFoundError } from "./errors/errors";
import { deleteFile, uploadFile } from "./image";

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

export const fetchQuestionById = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* Effect.tryPromise({
			try: () =>
				db.query.questions.findFirst({
					where: eq(questions.id, id),
					with: {
						options: true,
					},
				}),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to fetch question with id ${id}`,
				}),
		});

		if (result === undefined) {
			return yield* Effect.fail(new NotFoundError({ id, entity: "Question" }));
		}

		return result;
	});

export const createQuestions = (data: QuestionsFormData) =>
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

export const patchQuestion = (id: number, data: QuestionFormData) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const question = yield* fetchQuestionById(id);
		const payload = {
			quizId: data.quizId,
			materialId: data.materialId,
			description: data.description,
			question: data.question,
			imageLink: question.imageLink,
		};

		if (data.image instanceof File) {
			if (question.imageLink) {
				yield* deleteFile(question.imageLink);
			}
			payload.imageLink = yield* uploadFile(data.image);
		}

		yield* Effect.tryPromise({
			try: () =>
				db.transaction(async (tx) => {
					const [updatedQuestion] = await tx
						.update(questions)
						.set(payload)
						.where(eq(questions.id, id))
						.returning();

					if (!updatedQuestion) throw new Error("Failed to update question");

					await tx.delete(options).where(eq(options.questionId, id));

					if (data.options.length > 0) {
						await tx.insert(options).values(
							data.options.map((opt) => ({
								questionId: id,
								text: opt.text,
								isCorrect: opt.isCorrect,
							})),
						);
					}
				}),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to update question with id ${id}`,
				}),
		});

		return yield* fetchQuestionById(id);
	});

export const deleteQuestionById = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* Effect.tryPromise({
			try: () => db.delete(questions).where(eq(questions.id, id)).returning(),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to delete study material with id ${id}`,
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(
				new NotFoundError({ id, entity: "StudyMaterial" }),
			);
		}

		if (result[0].imageLink) {
			yield* deleteFile(result[0].imageLink);
		}

		return {
			success: true,
			id,
		};
	});
