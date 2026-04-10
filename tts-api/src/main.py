import logging
from hmac import compare_digest

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel

from src.config import settings
from src.storage import check_cache, delete_audio, upload_audio
from src.tts_service import synthesize

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="TelNetQuiz TTS Service")

MAX_TEXT_LENGTH = 5000


VOICE = "id-ID-ArdiNeural"


class SynthesizeRequest(BaseModel):
    text: str
    cache_key: str


class SynthesizeResponse(BaseModel):
    audio_url: str
    cached: bool


def verify_api_key(x_api_key: str = Header(...)):
    if not compare_digest(x_api_key, settings.TTS_API_KEY):
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/synthesize", response_model=SynthesizeResponse)
async def synthesize_endpoint(
    request: SynthesizeRequest,
    x_api_key: str = Header(...),
):
    verify_api_key(x_api_key)

    if len(request.text) > MAX_TEXT_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Text exceeds maximum length of {MAX_TEXT_LENGTH} characters",
        )

    cached_url = check_cache(request.cache_key)
    if cached_url:
        logger.info("Cache hit for key: %s", request.cache_key)
        return SynthesizeResponse(audio_url=cached_url, cached=True)

    logger.info("Cache miss for key: %s — generating audio", request.cache_key)
    try:
        audio_bytes = await synthesize(request.text, VOICE)
    except RuntimeError as e:
        logger.error("TTS generation failed: %s", e)
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        logger.error("Unexpected TTS error: %s", e)
        raise HTTPException(status_code=502, detail="TTS generation failed")

    audio_url = upload_audio(request.cache_key, audio_bytes)
    logger.info("Uploaded audio to R2: %s", audio_url)

    return SynthesizeResponse(audio_url=audio_url, cached=False)


@app.delete("/cache/{cache_key:path}", status_code=204)
async def delete_cache(
    cache_key: str,
    x_api_key: str = Header(...),
):
    verify_api_key(x_api_key)

    deleted = delete_audio(cache_key)
    if not deleted:
        raise HTTPException(status_code=404, detail="Cache entry not found")
