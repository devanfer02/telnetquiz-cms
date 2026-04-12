import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { questions, studyMaterials } from "@/database/schema";
import { Db } from "@/lib/db";
import { dbTryPromise } from "@/lib/retry";
import { fetchQuestionById } from "../content/questions";
import { fetchStudyMaterialById } from "../content/study-material";
import { DatabaseError, TtsServiceError } from "../errors/errors";

export { buildCacheKey, requestTtsAudio } from "./cache";

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export const constructTtsText = (type: string, id: number) =>
	Effect.gen(function* () {
		if (type === "question" || type === "pretest") {
			const question = yield* fetchQuestionById(id);

			const optionsText = question.options
				.map((opt, i) => `${LETTERS[i] ?? String(i + 1)}. ${opt.text}`)
				.join(". ");

			return `${question.description}. ${question.question}. Pilihan jawaban: ${optionsText}`;
		}

		if (type === "material") {
			const material = yield* fetchStudyMaterialById(id);
			const plainContent = material.content.replace(/<[^>]*>/g, "");
			return `${material.title}. ${plainContent}`;
		}

		return yield* Effect.fail(
			new TtsServiceError({
				cause: null,
				message: `Invalid TTS type: ${type}`,
			}),
		);
	});

export const getExistingAudioLink = (type: string, id: number) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const table = type === "material" ? studyMaterials : questions;

		const row = yield* dbTryPromise({
			try: () =>
				db
					.select({ audioLink: table.audioLink })
					.from(table)
					.where(eq(table.id, id))
					.limit(1),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to check audio_link for ${type} ${id}`,
				}),
		});

		return row[0]?.audioLink ?? null;
	});

export const persistAudioLink = (type: string, id: number, audioUrl: string) =>
	Effect.gen(function* () {
		const { db } = yield* Db;

		const table = type === "material" ? studyMaterials : questions;

		yield* dbTryPromise({
			try: () =>
				db.update(table).set({ audioLink: audioUrl }).where(eq(table.id, id)),
			catch: (err) =>
				new DatabaseError({
					cause: err,
					message: `Failed to persist audio_link for ${type} ${id}`,
				}),
		});
	});
