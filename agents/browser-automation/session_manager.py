"""Persistent session (cookies + localStorage) management for browser agents.

Sessions are stored as JSON files on disk so that subsequent runs can skip the
login step. The directory containing sessions must never be committed.
"""
from __future__ import annotations

import json
import shutil
from pathlib import Path

from playwright.sync_api import BrowserContext


class SessionManager:
    """Save and load Playwright BrowserContext storage state."""

    def __init__(self, base_dir: str | Path | None = None) -> None:
        if base_dir is None:
            base_dir = Path(__file__).with_suffix("").parent / "sessions"
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _session_path(self, site_name: str) -> Path:
        """Return the storage state file path for a given site."""
        safe_name = Path(str(site_name)).name or "default"
        return self.base_dir / f"{safe_name}_state.json"

    def exists(self, site_name: str) -> bool:
        """Return True if a saved session exists for the given site."""
        return self._session_path(site_name).exists()

    def load(self, context: BrowserContext, site_name: str) -> bool:
        """Load a previously saved session into the given browser context.

        Returns True if a session existed and was loaded, False otherwise.
        """
        path = self._session_path(site_name)
        if not path.exists():
            return False
        try:
            context.set_storage_state(path=str(path))
            return True
        except Exception:  # pragma: no cover
            # If the saved state is corrupted, remove it and return False.
            path.unlink(missing_ok=True)
            return False

    def save(self, context: BrowserContext, site_name: str) -> None:
        """Save the current browser context state to disk."""
        path = self._session_path(site_name)
        path.parent.mkdir(parents=True, exist_ok=True)
        context.storage_state(path=str(path))

    def delete(self, site_name: str) -> None:
        """Delete the saved session for a given site."""
        self._session_path(site_name).unlink(missing_ok=True)

    def clear_all(self) -> None:
        """Delete all saved sessions."""
        if self.base_dir.exists():
            shutil.rmtree(self.base_dir)
            self.base_dir.mkdir(parents=True, exist_ok=True)
