import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "BharatOS API"
    API_V1_STR: str = "/api/v1"
    
    APP_NAME: str = Field("BharatOS API", validation_alias="APP_NAME")
    APP_ENV: str = Field("development", validation_alias="APP_ENV")
    DEBUG: bool = Field(True, validation_alias="DEBUG")
    
    DATABASE_URL: str = Field(..., validation_alias="DATABASE_URL")
    SUPABASE_URL: str = Field(..., validation_alias="SUPABASE_URL")
    SUPABASE_JWT_SECRET: str = Field(..., validation_alias="SUPABASE_JWT_SECRET")
    SUPABASE_ANON_KEY: str = Field(..., validation_alias="SUPABASE_ANON_KEY")
    SUPABASE_SERVICE_ROLE_KEY: str = Field(..., validation_alias="SUPABASE_SERVICE_ROLE_KEY")
    
    GEMINI_API_KEY: str = Field("mock_key", validation_alias="GEMINI_API_KEY")
    WEATHER_API_URL: str = Field("https://api.open-meteo.com/v1", validation_alias="WEATHER_API_URL")

    CORS_ORIGINS: str = Field("http://localhost:3000", validation_alias="CORS_ORIGINS")

    @property
    def parsed_cors_origins(self) -> List[str]:
        if not self.CORS_ORIGINS:
            return []
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
