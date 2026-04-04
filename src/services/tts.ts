import { createHash } from "node:crypto";
import { Effect } from "effect";
import { env } from "@/lib/env";
import { TtsServiceError } from "./errors/errors";
import { fetchQuestionById } from "./questions";
import { fetchStudyMaterialById } from "./study-material";

const VOICE_MAP: Record<string, string> = {
	male: "id-ID-ArdiNeural",
	female: "id-ID-GadisNeural",
};

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export const hashId = (id: number): string =>
	createHash("sha256").update(String(id)).digest("hex").slice(0, 12);

export const buildCacheKey = (
	gender: string,
	type: string,
	id: number,
): string => `${gender}/${type}-${hashId(id)}-audio`;

export const genderToVoice = (gender: string): string =>
	VOICE_MAP[gender] ?? VOICE_MAP.female;

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

export const requestTtsAudio = (
	text: string,
	voice: string,
	cacheKey: string,
) =>
	Effect.gen(function* () {
		const result = yield* Effect.tryPromise({
			try: async () => {
				const res = await fetch(`${env.TTS_SERVICE_URL}/synthesize`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-api-key": env.TTS_SERVICE_API_KEY,
					},
					body: JSON.stringify({
						text,
						voice,
						cache_key: cacheKey,
					}),
				});

				if (!res.ok) {
					const body = await res.text();
					throw new Error(`TTS service returned ${res.status}: ${body}`);
				}

				return (await res.json()) as {
					audio_url: string;
					cached: boolean;
				};
			},
			catch: (err) =>
				new TtsServiceError({
					cause: err,
					message:
						err instanceof Error ? err.message : "Failed to call TTS service",
				}),
		});

		return result;
	});

export const invalidateTtsCache = (type: string, id: number) =>
	Effect.gen(function* () {
		const genders = ["male", "female"];

		for (const gender of genders) {
			const cacheKey = buildCacheKey(gender, type, id);

			yield* Effect.tryPromise({
				try: () =>
					fetch(`${env.TTS_SERVICE_URL}/cache/${cacheKey}`, {
						method: "DELETE",
						headers: { "x-api-key": env.TTS_SERVICE_API_KEY },
					}),
				catch: () => null,
			}).pipe(Effect.catchAll(() => Effect.void));
		}
	});
