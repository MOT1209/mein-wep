"""Configuration and environment variable loader for browser automation.

All credentials are loaded from a local `.env` file. This module never stores
secrets in code. It is the only place where environment variables are read.
"""
from __future__ import annotations

import os
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError as exc:  # pragma: no cover - user sees a friendly error
    raise ImportError("python-dotenv is required. Install: pip install python-dotenv") from exc

# Load .env from the same directory as this file
_ENV_PATH = Path(__file__).with_suffix("").parent / ".env"
if _ENV_PATH.exists():
    load_dotenv(_ENV_PATH, override=False)
else:
    # Also try project root .env for convenience
    _ROOT_ENV = Path(__file__).resolve().parents[2] / ".env"
    if _ROOT_ENV.exists():
        load_dotenv(_ROOT_ENV, override=False)


class Config:
    """Read-only config container backed by environment variables."""

    @staticmethod
    def _get(key: str, default: str | None = None) -> str | None:
        value = os.getenv(key)
        if value is None:
            return default
        return value.strip() or default

    @staticmethod
    def get_required(key: str) -> str:
        value = Config._get(key)
        if value is None:
            raise ValueError(f"Missing required environment variable: {key}")
        return value

    # --- Service credentials ---

    @property
    def google_email(self) -> str:
        return Config.get_required("GOOGLE_EMAIL")

    @property
    def google_password(self) -> str:
        return Config.get_required("GOOGLE_PASSWORD")

    @property
    def github_email(self) -> str:
        return Config.get_required("GITHUB_EMAIL")

    @property
    def github_password(self) -> str:
        return Config.get_required("GITHUB_PASSWORD")

    @property
    def hf_email(self) -> str:
        return Config.get_required("HF_EMAIL")

    @property
    def hf_password(self) -> str:
        return Config.get_required("HF_PASSWORD")

    @property
    def hf_token(self) -> str | None:
        return Config._get("HF_TOKEN")

    # --- Browser settings ---

    @property
    def headless(self) -> bool:
        return Config._get("BROWSER_HEADLESS", "false").lower() in {"1", "true", "yes"}

    @property
    def slow_mo(self) -> int:
        try:
            return int(Config._get("BROWSER_SLOW_MO", "100") or "100")
        except ValueError:
            return 100
