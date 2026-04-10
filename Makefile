.PHONY: dev dev\:cms dev\:tts tts\:batch tts\:purge seed\:content seed\:mock

# Start both CMS and TTS API concurrently
dev:
	@trap 'kill 0' INT TERM; \
	$(MAKE) dev\:cms & \
	$(MAKE) dev\:tts & \
	wait

dev\:cms:
	bun run dev

dev\:tts:
	$(MAKE) -C tts-api dev

tts\:batch:
	bun run tts:batch

tts\:purge:
	bun run tts:purge

seed\:content:
	bun run db:seed-content

seed\:mock:
	bun run db:seed-mock
