import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";
import { DbLayer } from "@/lib/db";
import { HttpStatus, response } from "@/lib/http";
import { withApiErrorHandling } from "@/lib/sentry/effect";
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
								const id = Number(params.id);

								if (
									!VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])
								) {
									return response(
										{
											message: `Invalid type: ${type}. Must be one of: ${VALID_TYPES.join(", ")}`,
										},
										HttpStatus.BAD_REQUEST,
									);
								}

								if (Number.isNaN(id)) {
									return response(
										{ message: "Invalid id" },
										HttpStatus.BAD_REQUEST,
									);
								}

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
