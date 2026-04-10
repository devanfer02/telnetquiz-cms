.PHONY: dev dev\:cms dev\:tts tts\:batch tts\:purge seed\:content seed\:mock docker\:up docker\:down docker\:build docker\:logs

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

# Docker
docker\:up:
	docker compose up -d

docker\:down:
	docker compose down

docker\:build:
	docker compose build

docker\:logs:
	docker compose logs -f
