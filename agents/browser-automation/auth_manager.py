"""Simple credential helper that wraps ``Config`` for site-specific agents.

This keeps the credential loading in one place and makes the example agents
shorter and harder to get wrong.
"""
from __future__ import annotations

from config import Config


class AuthManager:
    """Return credentials for a given service from environment variables."""

    def __init__(self) -> None:
        self._config = Config()

    def get(self, service: str) -> dict[str, str]:
        """Return email/password dict for a supported service.

        Supported services: google, github, hf (Hugging Face).
        """
        service = service.lower()
        if service == "google":
            return {
                "email": self._config.google_email,
                "password": self._config.google_password,
            }
        if service == "github":
            return {
                "email": self._config.github_email,
                "password": self._config.github_password,
            }
        if service in {"hf", "huggingface", "hugging_face"}:
            return {
                "email": self._config.hf_email,
                "password": self._config.hf_password,
                "token": self._config.hf_token or "",
            }
        raise ValueError(f"Unsupported service: {service}")

    def has_session_token(self, service: str) -> bool:
        """Return True if a token (e.g. HF read token) is configured."""
        service = service.lower()
        if service in {"hf", "huggingface", "hugging_face"}:
            return self._config.hf_token is not None and bool(self._config.hf_token.strip())
        return False
