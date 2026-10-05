import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "AutoPM – The Zero-Touch Status Reporter"
    API_PORT: int = int(os.getenv("PORT", "8000"))
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "auto").lower()  # "openrouter", "openai", "anthropic", "auto"
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    ANTHROPIC_MODEL: str = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
    FORCE_DEMO_MODE: bool = os.getenv("FORCE_DEMO_MODE", "false").lower() in ("true", "1", "yes")

settings = Settings()
