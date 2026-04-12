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

const TTS_REPLACEMENTS: [RegExp, string][] = [
	[/\bprotocol\b/gi, "protokol"],
	[/\blayer\b/gi, "leyer"],
	[/\brouter\b/gi, "ruter"],
	[/\bswitch\b/gi, "suwitch"],
	[/\bserver\b/gi, "server"],
	[/\bbrowser\b/gi, "brauser"],
	[/\bgateway\b/gi, "geitwey"],
	[/\bfirewall\b/gi, "faierwal"],
	[/\bbandwidth\b/gi, "bendwith"],
	[/\bhandshake\b/gi, "hendsheik"],
];

function applyTtsPronunciation(text: string): string {
	let result = text;
	for (const [pattern, replacement] of TTS_REPLACEMENTS) {
		result = result.replace(pattern, replacement);
	}
	return result;
}

export const constructTtsText = (type: string, id: number) =>
	Effect.gen(function* () {
		if (type === "question" || type === "pretest") {
			const question = yield* fetchQuestionById(id);

			const optionsText = question.options
				.map((opt, i) => `${LETTERS[i] ?? String(i + 1)}. ${opt.text}`)
				.join(". ");

			return applyTtsPronunciation(
				`${question.description}. ${question.question}. Pilihan jawaban: ${optionsText}`,
			);
		}

		if (type === "material") {
			const material = yield* fetchStudyMaterialById(id);
			const plainContent = material.content.replace(/<[^>]*>/g, "");
			return applyTtsPronunciation(`${material.title}. ${plainContent}`);
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
