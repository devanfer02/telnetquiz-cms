import { questions, quizzes, submissions } from "@/database/schema";
import { Db } from "@/lib/db";
import { desc, eq, sql } from "drizzle-orm";
import { Effect } from "effect";
import { DatabaseError, NotFoundError, ValidationError } from "./errors/errors";
import { QuizFormData } from "@/types/zod";

export const fetchAllQuizzes = Effect.gen(function* () {
	const { db } = yield* Db;

	return yield* Effect.tryPromise({
		try: () =>
			db.query.quizzes.findMany({
				orderBy: desc(quizzes.createdAt),
				with: {
					chapter: true,
				},
				extras: {
					numberOfQuestions: sql<number>`(
          SELECT count(*)
          FROM ${questions}
          WHERE "questions"."quizId" = "quizzes"."id"
        )`.as("numberOfQuestions"),
				},
			}),
		catch: (err) =>
			new DatabaseError({
				cause: err,
				message: "Failed to fetch quizzes",
			}),
	});
});

export const fetchQuizById = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* Effect.tryPromise({
			try: () =>
				db.query.quizzes.findFirst({
					where: eq(quizzes.id, id),
					with: {
						questions: true,
					},
					extras: {
						numberOfQuestions: sql<number>`(
            SELECT count(*)
            FROM ${questions}
            WHERE "questions"."quizId" = "quizzes"."id"
          )`.as("numberOfQuestions"),
					},
				}),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to fetch quiz with id ${id}`,
				}),
		});

		if (result === undefined) {
			return yield* Effect.fail(new NotFoundError({ id, entity: "Quiz" }));
		}

		return result;
	});

export const createQuiz = (quiz: QuizFormData) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* Effect.tryPromise({
			try: () => db.insert(quizzes).values(quiz).returning(),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: "Failed to create chapter",
				}),
		});

		return result[0];
	});

export const patchQuiz = (id: number, quiz: QuizFormData) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* Effect.tryPromise({
			try: () =>
				db.update(quizzes).set(quiz).where(eq(quizzes.id, id)).returning(),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to update quiz with id ${id}`,
				}),
		});

		if (result.length === 0) {
			return yield* Effect.fail(new NotFoundError({ id, entity: "Quiz" }));
		}

		return result[0];
	});

export const deleteQuiz = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		yield* Effect.tryPromise({
			try: () => db.delete(quizzes).where(eq(quizzes.id, id)),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to delete quiz with id ${id}`,
				}),
		});

		return { success: true, id };
	});

export const fetchQuizByIdWithQuestionsAndOptions = (id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const result = yield* Effect.tryPromise({
			try: () =>
				db.query.quizzes.findFirst({
					where: eq(quizzes.id, id),
					with: {
						questions: {
							with: {
								options: true,
							},
						},
					},
				}),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to fetch quiz with id ${id}`,
				}),
		});

		if (result === undefined) {
			return yield* Effect.fail(new NotFoundError({ id, entity: "Quiz" }));
		}

		return result;
	});

export const submitQuizAnswers = (
	quizId: number,
	userId: string,
	answers: QuizAnswerItem[],
) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const quiz = yield* Effect.tryPromise({
			try: () =>
				db.query.quizzes.findFirst({
					where: eq(quizzes.id, quizId),
					with: {
						questions: {
							with: {
								options: true,
							},
						},
					},
				}),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to fetch quiz with id ${quizId}`,
				}),
		});

		if (quiz === undefined) {
			return yield* Effect.fail(
				new NotFoundError({ id: quizId, entity: "Quiz" }),
			);
		}

		const questionIds = answers.map((a) => a.question_id);
		const quizQuestionIds = quiz.questions.map((q) => q.id);

		for (const qId of questionIds) {
			if (!quizQuestionIds.includes(qId)) {
				return yield* Effect.fail(
					new ValidationError({
						errors: { message: `Question ${qId} does not belong to this quiz` },
					}),
				);
			}
		}

		const wrongAnswers: number[] = [];
		let correctCount = 0;

		for (const answer of answers) {
			const question = quiz.questions.find((q) => q.id === answer.question_id);
			if (!question) continue;

			const correctOption = question.options.find((o) => o.isCorrect);
			if (correctOption?.id === answer.answered_option_id) {
				correctCount++;
			} else {
				wrongAnswers.push(answer.question_id);
			}
		}

		const totalQuestions = answers.length;
		const score =
			totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

		yield* Effect.tryPromise({
			try: () =>
				db.insert(submissions).values({
					userId,
					chapterId: quiz.chapterId,
					quizId,
					score: Math.round(score),
				}),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: "Failed to save quiz submission",
				}),
		});

		if (wrongAnswers.length > 0) {
			return {
				passed: false,
				wrong_question_ids: wrongAnswers,
				correct_answers: correctCount,
				total_questions: totalQuestions,
				score_percentage: score,
			};
		}

		return {
			passed: true,
			correct_answers: correctCount,
			total_questions: totalQuestions,
			score_percentage: score,
		};
	});
