"""Application configuration via environment variables."""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "FlowCast + BarrierLens"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    DATABASE_URL: str = "postgresql+asyncpg://flowcast:flowcast@localhost:5432/flowcast"
    DATABASE_URL_SYNC: str = "postgresql://flowcast:flowcast@localhost:5432/flowcast"

    JWT_SECRET: str = "change-me-in-production-use-a-real-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_TYPES: list[str] = ["image/jpeg", "image/png", "image/webp"]

    OSRM_BASE_URL: str = "http://localhost:5000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
