import { createHash } from "node:crypto";
import { Effect } from "effect";
import { env } from "@/lib/env";
import { TtsServiceError } from "./errors/errors";

export const hashId = (id: number): string =>
	createHash("sha256").update(String(id)).digest("hex").slice(0, 12);

export const buildCacheKey = (type: string, id: number): string =>
	`${type}-${hashId(id)}-audio`;

export const requestTtsAudio = (text: string, cacheKey: string) =>
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
		const cacheKey = buildCacheKey(type, id);

		yield* Effect.tryPromise({
			try: () =>
				fetch(`${env.TTS_SERVICE_URL}/cache/${cacheKey}`, {
					method: "DELETE",
					headers: { "x-api-key": env.TTS_SERVICE_API_KEY },
				}),
			catch: () => null,
		}).pipe(Effect.catchAll(() => Effect.void));
	});
