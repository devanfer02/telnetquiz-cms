import boto3
from botocore.exceptions import ClientError

from src.config import settings

s3 = boto3.client(
    "s3",
    endpoint_url=settings.CLOUDFLARE_R2_API,
    aws_access_key_id=settings.CLOUDFLARE_ACCESS_KEY,
    aws_secret_access_key=settings.CLOUDFLARE_SECRET_KEY,
    region_name="auto",
)


def check_cache(cache_key: str) -> str | None:
    try:
        s3.head_object(Bucket=settings.CLOUDFLARE_BUCKET, Key=f"tts/{cache_key}.mp3")
        return f"{settings.CLOUDFLARE_R2_DOMAIN}/tts/{cache_key}.mp3"
    except ClientError as e:
        if e.response["Error"]["Code"] == "404":
            return None
        raise


def upload_audio(cache_key: str, data: bytes) -> str:
    s3.put_object(
        Bucket=settings.CLOUDFLARE_BUCKET,
        Key=f"tts/{cache_key}.mp3",
        Body=data,
        ContentType="audio/mpeg",
    )
    return f"{settings.CLOUDFLARE_R2_DOMAIN}/tts/{cache_key}.mp3"


def delete_audio(cache_key: str) -> bool:
    try:
        s3.head_object(Bucket=settings.CLOUDFLARE_BUCKET, Key=f"tts/{cache_key}.mp3")
    except ClientError as e:
        if e.response["Error"]["Code"] == "404":
            return False
        raise

    s3.delete_object(Bucket=settings.CLOUDFLARE_BUCKET, Key=f"tts/{cache_key}.mp3")
    return True
