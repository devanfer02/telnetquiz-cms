from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    TTS_API_KEY: str
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    CLOUDFLARE_R2_API: str
    CLOUDFLARE_ACCESS_KEY: str
    CLOUDFLARE_SECRET_KEY: str
    CLOUDFLARE_BUCKET: str
    CLOUDFLARE_R2_DOMAIN: str


settings = Settings()
