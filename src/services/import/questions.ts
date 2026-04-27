import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { options, questions } from "@/database/schema";
import { Db } from "@/lib/db";
import { dbTryPromise } from "@/lib/retry";
import { invalidateTtsCache } from "@/services/tts/cache";
import type { ImportOptionData } from "@/types/zod";
import { DatabaseError, NotFoundError } from "../errors/errors";

export type UpdateQuestionFromImportPayload = {
	type: "pretest" | "quiz";
	description: string;
	question: string;
	imageLink: string | null;
	options: ImportOptionData[];
};

export const updateQuestionFromImport = (
	id: number,
	data: UpdateQuestionFromImportPayload,
) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const updatedRows = yield* dbTryPromise({
			try: () =>
				db.transaction(async (tx) => {
					const updated = await tx
						.update(questions)
						.set({
							description: data.description,
							question: data.question,
							imageLink: data.imageLink,
						})
						.where(eq(questions.id, id))
						.returning({ id: questions.id });

					if (updated.length === 0) return updated;

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

					return updated;
				}),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to import-update question with id ${id}`,
				}),
		});

		if (updatedRows.length === 0) {
			return yield* Effect.fail(new NotFoundError({ id, entity: "Question" }));
		}

		yield* invalidateTtsCache(data.type, id).pipe(
			Effect.catchAll(() => Effect.void),
		);

		return { id };
	});
