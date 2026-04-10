"""
Batch TTS converter — reads JSON items from stdin, synthesizes audio via edge-tts,
uploads to Cloudflare R2.

Input format (JSON array on stdin):
[
  {"text": "Text to synthesize", "cache_key": "question-abc123-audio"},
  ...
]

Output format (JSON array on stdout):
[
  {"cache_key": "...", "status": "generated", "audio_url": "..."},
  {"cache_key": "...", "status": "cached", "audio_url": "..."},
  {"cache_key": "...", "status": "failed", "error": "..."},
  ...
]
"""

import asyncio
import json
import sys
import logging

from src.config import settings
from src.storage import check_cache, upload_audio
from src.tts_service import synthesize

logging.basicConfig(level=logging.INFO, stream=sys.stderr)
logger = logging.getLogger(__name__)

VOICE = "id-ID-ArdiNeural"


async def process_item(item: dict) -> dict:
    text = item["text"]
    cache_key = item["cache_key"]

    cached_url = check_cache(cache_key)
    if cached_url:
        return {"cache_key": cache_key, "status": "cached", "audio_url": cached_url}

    try:
        audio_bytes = await synthesize(text, VOICE)
        audio_url = upload_audio(cache_key, audio_bytes)
        return {"cache_key": cache_key, "status": "generated", "audio_url": audio_url}
    except Exception as e:
        logger.error("Failed %s: %s", cache_key, e)
        return {"cache_key": cache_key, "status": "failed", "error": str(e)}


async def main():
    raw = sys.stdin.read()
    items = json.loads(raw)

    if not isinstance(items, list):
        print(json.dumps({"error": "Input must be a JSON array"}), file=sys.stderr)
        sys.exit(1)

    logger.info("Processing %d items...", len(items))

    results = []
    for i, item in enumerate(items):
        result = await process_item(item)
        results.append(result)

        symbol = {"generated": "✓", "cached": ".", "failed": "✗"}.get(result["status"], "?")
        print(symbol, end="", file=sys.stderr, flush=True)

        if (i + 1) % 50 == 0:
            print(f" [{i + 1}/{len(items)}]", file=sys.stderr, flush=True)

    print(file=sys.stderr)

    generated = sum(1 for r in results if r["status"] == "generated")
    cached = sum(1 for r in results if r["status"] == "cached")
    failed = sum(1 for r in results if r["status"] == "failed")
    logger.info("Done: %d generated, %d cached, %d failed", generated, cached, failed)

    print(json.dumps(results))


if __name__ == "__main__":
    asyncio.run(main())
