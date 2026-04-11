import { Effect } from "effect";
import { fetchQuestionById } from "../content/questions";
import { fetchStudyMaterialById } from "../content/study-material";
import { TtsServiceError } from "../errors/errors";

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
