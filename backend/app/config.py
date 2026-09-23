"""
CAT Operator Copilot - Centralized Configuration & Secrets Management
=====================================================================
Loads environment variables from backend/.env using python-dotenv.
Provides typed access to server configs, secrets, safety thresholds, and ML parameters.
"""

import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Resolve paths
BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BACKEND_DIR / ".env"

# Load backend/.env if it exists
if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)
else:
    # Also check root directory .env
    ROOT_ENV_PATH = BACKEND_DIR.parent / ".env"
    if ROOT_ENV_PATH.exists():
        load_dotenv(dotenv_path=ROOT_ENV_PATH)


class Settings:
    # Application & Environment
    APP_NAME: str = "CAT Operator Copilot Intelligence API"
    APP_VERSION: str = "2.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() in ("true", "1", "yes")

    # Server Network Binding
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))

    # Security & API Secrets
    SECRET_KEY: str = os.getenv("SECRET_KEY", "cat-copilot-dev-secret-key-329847293847293847")
    API_KEY: str = os.getenv("API_KEY", "cat-operator-internal-api-key")
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3005,http://127.0.0.1:3005"
        ).split(",")
        if origin.strip()
    ]

    # Local AI Copilot / LLM (Ollama)
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.1:8b")
    OLLAMA_TIMEOUT_SECONDS: float = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "8.0"))

    # Machine Safety Envelopes & Deterministic Thresholds (Meters)
    SAFETY_CRITICAL_DISTANCE_METERS: float = float(os.getenv("SAFETY_CRITICAL_DISTANCE_METERS", "3.0"))
    SAFETY_HIGH_DISTANCE_METERS: float = float(os.getenv("SAFETY_HIGH_DISTANCE_METERS", "5.0"))
    SAFETY_WARNING_DISTANCE_METERS: float = float(os.getenv("SAFETY_WARNING_DISTANCE_METERS", "10.0"))

    # Machine Physics Limiters
    MAX_HYDRAULIC_PRESSURE_BAR: float = float(os.getenv("MAX_HYDRAULIC_PRESSURE_BAR", "350.0"))
    MAX_ROLL_ANGLE_DEG: float = float(os.getenv("MAX_ROLL_ANGLE_DEG", "15.0"))
    MAX_PERCLOS_FATIGUE: float = float(os.getenv("MAX_PERCLOS_FATIGUE", "0.35"))

    # Machine Identification & Edge Node
    DEFAULT_MACHINE_ID: str = os.getenv("DEFAULT_MACHINE_ID", "EXC-320-CAT-09")
    DEFAULT_OPERATOR_ID: str = os.getenv("DEFAULT_OPERATOR_ID", "OP-RAJ-4492")


settings = Settings()
