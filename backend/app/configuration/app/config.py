import os
from typing import List, Optional
try:
    # pydantic v2 moved BaseSettings to pydantic-settings package
    from pydantic_settings import BaseSettings
except Exception:
    # fallback for older pydantic where BaseSettings still in pydantic
    from pydantic import BaseSettings
from pydantic import Field
from dotenv import load_dotenv, find_dotenv

# Load .env from repository root (if present) so settings work when running from /backend
dotenv_path = find_dotenv(filename=".env", raise_error_if_not_found=False)
if dotenv_path:
    load_dotenv(dotenv_path)


class Settings(BaseSettings):
    MYSQL_USER: Optional[str] = None
    MYSQL_PASSWORD: Optional[str] = None
    MYSQL_DATABASE: Optional[str] = None
    MYSQL_HOST: str = "mysql"
    MYSQL_PORT: int = 3306

    # Allow supplying full DATABASE_URL or build from MYSQL_* vars
    DATABASE_URL: Optional[str] = None

    # JWT / Security
    JWT_SECRET: str = Field("SUPER_SECRET_KEY_IPSCF", env="JWT_SECRET")
    JWT_ALGORITHM: str = Field("HS256", env="JWT_ALGORITHM")
    JWT_EXPIRE_MINUTES: int = Field(60, env="JWT_EXPIRE_MINUTES")

    # CORS / Frontend origins (comma separated)
    CORS_ORIGINS: List[str] = Field(["http://localhost:41777"], env="CORS_ORIGINS")

    # App environment
    APP_ENV: str = Field("development", env="APP_ENV")

    model_config = {"env_file": ".env", "extra": "ignore"}

    def __init__(self, **data):
        super().__init__(**data)
        # Build DATABASE_URL if not provided
        if not self.DATABASE_URL and self.MYSQL_USER and self.MYSQL_PASSWORD and self.MYSQL_DATABASE:
            self.DATABASE_URL = (
                f"mysql+mysqldb://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}"
            )


settings = Settings()
