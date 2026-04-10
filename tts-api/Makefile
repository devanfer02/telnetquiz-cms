.PHONY: dev batch\:convert

dev:
	uv run uvicorn src.main:app --reload --port 8000

batch\:convert:
	uv run python -m src.batch
