import os
from app.core.config import settings

GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME", "gemini-3.6-flash")
GEMINI_API_KEY = settings.GEMINI_API_KEY
TEMPERATURE = float(os.getenv("GEMINI_TEMPERATURE", "0.2"))
MAX_OUTPUT_TOKENS = int(os.getenv("GEMINI_MAX_OUTPUT_TOKENS", "2048"))
TIMEOUT = float(os.getenv("GEMINI_TIMEOUT", "30.0"))

def get_ai_config():
    key = GEMINI_API_KEY
    if not key or key == "mock_key":
        # Returns config even if key is mocked (safe fallback handling)
        pass
    return {
        "model": GEMINI_MODEL_NAME,
        "temperature": TEMPERATURE,
        "max_output_tokens": MAX_OUTPUT_TOKENS,
        "timeout": TIMEOUT,
        "api_key": key
    }
