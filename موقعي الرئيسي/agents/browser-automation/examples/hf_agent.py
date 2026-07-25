"""Example agent that logs into Hugging Face and reads the profile name.

Usage:
    python agents/browser-automation/examples/hf_agent.py

Required env vars (set in agents/browser-automation/.env):
    HF_EMAIL
    HF_PASSWORD
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from base_agent import BaseBrowserAgent
from auth_manager import AuthManager


class HuggingFaceAgent(BaseBrowserAgent):
    """Automates Hugging Face login and basic profile navigation."""

    def __init__(self) -> None:
        super().__init__(site_name="huggingface", start_url="https://huggingface.co/login")
        self.creds = AuthManager().get("hf")

    def is_logged_in(self) -> bool:
        return self.page.locator("a[href='/logout']").count() > 0 or \
               self.page.locator("[data-target='UserDropdown']").count() > 0

    def execute_task(self, page) -> None:
        if self.is_logged_in():
            print("[HF] Already logged in via saved session.")
            return

        print("[HF] Logging in...")
        self.type_like_human("input[name='email']", self.creds["email"])
        self.type_like_human("input[name='password']", self.creds["password"])
        self.click_like_human("button[type='submit']")

        page.wait_for_load_state("networkidle")
        if self.is_logged_in():
            print("[HF] Login successful.")
        else:
            print("[HF] Login may have failed or 2FA/CAPTCHA required.")
            print(f"[HF] Current URL: {page.url}")


if __name__ == "__main__":
    agent = HuggingFaceAgent()
    agent.run()
