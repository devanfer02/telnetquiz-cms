import { asc, desc, eq } from "drizzle-orm";
import { Effect } from "effect";
import { options, questions } from "@/database/schema";
import { Db } from "@/lib/db";
import { dbTryPromise } from "@/lib/retry";
import type { QuestionFormData, QuestionsFormData } from "@/types/zod";
import { DatabaseError, NotFoundError } from "./errors/errors";
import { deleteFile, uploadFile } from "./image";
import { invalidateTtsCache } from "./tts";

export const fetchAllQuestions = Effect.gen(function* () {
	const { db } = yield* Db;

	return yield* dbTryPromise({
		try: () =>
			db.query.questions.findMany({
				orderBy: desc(questions.createdAt),
				with: {
					options: true,
				},
			}),
		catch: (err) =>
			new DatabaseError({
				cause: err,
				message: "Failed to fetch questions",
			}),
	});
});

export const fetchQuestionsByType = (type: "pretest" | "quiz") =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const [questionRows, optionRows] = yield* Effect.all([
			dbTryPromise({
				try: () =>
					db
						.select()
						.from(questions)
						.where(eq(questions.type, type))
						.orderBy(asc(questions.chapterId), asc(questions.id)),
				catch: (err) =>
					new DatabaseError({
						cause: err,
						message: `Failed to fetch questions of type ${type}`,
					}),
			}),
			dbTryPromise({
				try: () =>
					db
						.select({
							id: options.id,
							questionId: options.questionId,
							text: options.text,
							isCorrect: options.isCorrect,
						})
						.from(options)
						.innerJoin(questions, eq(options.questionId, questions.id))
						.where(eq(questions.type, type)),
				catch: (err) =>
					new DatabaseError({
						cause: err,
						message: `Failed to fetch options for ${type} questions`,
					}),
			}),
		]);

		const optionsByQuestionId = new Map<
			number,
			(typeof optionRows)[number][]
		>();
		for (const row of optionRows) {
			const list = optionsByQuestionId.get(row.questionId) ?? [];
			list.push(row);
			optionsByQuestionId.set(row.questionId, list);
		}

		return questionRows.map((q) => ({
			...q,
			options: optionsByQuestionId.get(q.id) ?? [],
		}));
	});

export const fetchQuestionById = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* dbTryPromise({
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
					return {
						...q,
						imageLink,
						quizId: q.quizId === 0 ? null : q.quizId,
						chapterId: q.chapterId === 0 ? null : q.chapterId,
						materialId: q.materialId === 0 ? null : q.materialId,
					};
				}),
			),
			{ concurrency: 5 },
		);

		yield* dbTryPromise({
			try: () =>
				db.transaction(async (tx) => {
					if (questionsWithImages.length === 0) return;

					const insertedQuestions = await tx
						.insert(questions)
						.values(
							questionsWithImages.map((q) => ({
								type: data.type,
								quizId: q.quizId,
								chapterId: q.chapterId,
								materialId: q.materialId,
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

		return {
			success: true,
		};
	});

export const patchQuestion = (id: number, data: QuestionFormData) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const question = yield* fetchQuestionById(id);
		const payload = {
			type: data.type,
			quizId: data.quizId,
			chapterId: data.chapterId,
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

		yield* dbTryPromise({
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

		// Fire-and-forget TTS cache invalidation
		yield* invalidateTtsCache(data.type, id).pipe(
			Effect.catchAll(() => Effect.void),
		);

		return yield* fetchQuestionById(id);
	});

export const deleteQuestionById = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* dbTryPromise({
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
