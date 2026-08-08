import os
from app.core.config import settings

GEMINI_MODEL_NAME = "gemini-2.5-pro"
GEMINI_API_KEY = settings.GEMINI_API_KEY

def get_ai_config():
    return {
        "model": GEMINI_MODEL_NAME,
        "temperature": 0.2,
        "max_output_tokens": 2048,
        "api_key": GEMINI_API_KEY
    }
