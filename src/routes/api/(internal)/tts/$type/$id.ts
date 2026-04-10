import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, parseNumericId, response } from "@/lib/http";
import { withApiErrorHandling } from "@/lib/sentry/effect";
import { ValidationError } from "@/services/errors/errors";
import {
	buildCacheKey,
	constructTtsText,
	requestTtsAudio,
} from "@/services/tts";

const VALID_TYPES = ["question", "pretest", "material"] as const;

export const Route = createFileRoute("/api/(internal)/tts/$type/$id")({
	server: {
		handlers: ({ createHandlers }) =>
			createHandlers({
				GET: async ({ params }) =>
					Effect.runPromise(
						withApiErrorHandling(
							Effect.gen(function* () {
								const { type } = params;

								if (
									!VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])
								) {
									return yield* Effect.fail(
										new ValidationError({
											errors: {
												type: `Invalid type: ${type}. Must be one of: ${VALID_TYPES.join(", ")}`,
											},
										}),
									);
								}

								const id = yield* parseNumericId(params.id);
								const cacheKey = buildCacheKey(type, id);
								const text = yield* constructTtsText(type, id);
								const result = yield* requestTtsAudio(text, cacheKey);

								return response(
									{
										message: result.cached
											? "TTS audio found in cache"
											: "TTS audio generated",
										data: {
											audio_url: result.audio_url,
										},
									},
									HttpStatus.OK,
								);
							}).pipe(Effect.provide(DbLayer)),
						),
					),
			}),
	},
});
