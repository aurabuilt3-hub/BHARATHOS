import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    DATABASE_URL: str = Field(..., validation_alias="DATABASE_URL")
    SUPABASE_URL: str = Field(..., validation_alias="SUPABASE_URL")
    SUPABASE_JWT_SECRET: str = Field(..., validation_alias="SUPABASE_JWT_SECRET")
    SUPABASE_ANON_KEY: str = Field(..., validation_alias="SUPABASE_ANON_KEY")
    SUPABASE_SERVICE_ROLE_KEY: str = Field(..., validation_alias="SUPABASE_SERVICE_ROLE_KEY")
    GEMINI_API_KEY: str = Field("mock_key", validation_alias="GEMINI_API_KEY")
    WEATHER_API_URL: str = Field("https://api.open-meteo.com/v1", validation_alias="WEATHER_API_URL")

    # Load from .env file inside backend or root
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
