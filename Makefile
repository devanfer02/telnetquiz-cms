-include .env
export

GHCR_OWNER ?= devanfer02
CMS_IMAGE   = ghcr.io/$(GHCR_OWNER)/telnetquiz-cms
TTS_IMAGE   = ghcr.io/$(GHCR_OWNER)/telnetquiz-tts
TAG         ?= latest

.PHONY: dev dev\:cms dev\:tts tts\:batch tts\:purge seed\:content seed\:mock img\:upload populate-content docker\:up docker\:down docker\:build docker\:logs ghcr\:login ghcr\:build ghcr\:push ghcr\:build-push

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

img\:upload:
	bun run img:upload

populate-content:
	$(MAKE) img\:upload
	$(MAKE) seed\:content
	$(MAKE) tts\:batch

# GHCR
ghcr\:login:
ifdef GHCR_TOKEN
	docker login ghcr.io -u devanfer02 --password "$(GHCR_TOKEN)"
else
	@echo "GHCR_TOKEN not set. Please set it in your environment."
endif

ghcr\:build:
	docker build -t $(CMS_IMAGE):$(TAG) .
	docker build -t $(TTS_IMAGE):$(TAG) ./tts-api

ghcr\:push:
	docker push $(CMS_IMAGE):$(TAG)
	docker push $(TTS_IMAGE):$(TAG)

ghcr\:build-push: ghcr\:build ghcr\:push
