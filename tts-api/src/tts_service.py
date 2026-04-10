from io import BytesIO

import edge_tts

from src.pronunciation import preprocess_for_tts


async def synthesize(text: str, voice: str) -> bytes:
    text = preprocess_for_tts(text)
    communicate = edge_tts.Communicate(text, voice)
    buffer = BytesIO()

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            buffer.write(chunk["data"])

    audio_bytes = buffer.getvalue()
    if not audio_bytes:
        raise RuntimeError("No audio data received from edge-tts")

    return audio_bytes
