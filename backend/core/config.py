import os
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Load environment variables from root directory
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))


class Settings:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev_secret_auto_fallback")
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    def __init__(self):
        if not self.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY not found. AI features will be disabled.")
        if self.SECRET_KEY == "dev_secret_auto_fallback":
            logger.warning("Using default SECRET_KEY. Please set a secure key in production.")


settings = Settings()
