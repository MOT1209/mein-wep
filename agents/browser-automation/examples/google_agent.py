"""Example agent that logs into a Google service and prints the page title.

Usage:
    python agents/browser-automation/examples/google_agent.py

Required env vars (set in agents/browser-automation/.env):
    GOOGLE_EMAIL
    GOOGLE_PASSWORD
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from base_agent import BaseBrowserAgent
from auth_manager import AuthManager


class GoogleAgent(BaseBrowserAgent):
    """Automates Google account login.

    Google uses heavy bot detection, so this example may require CAPTCHA or
    2FA on first login. The session is saved so subsequent runs can skip the
    password step.
    """

    def __init__(self) -> None:
        super().__init__(site_name="google", start_url="https://accounts.google.com/")
        self.creds = AuthManager().get("google")

    def is_logged_in(self) -> bool:
        # A simple heuristic: if we are redirected away from the sign-in page.
        return "signin" not in self.page.url.lower()

    def execute_task(self, page) -> None:
        if self.is_logged_in():
            print("[Google] Already logged in via saved session.")
            return

        print("[Google] Entering email...")
        self.type_like_human("input[type='email']", self.creds["email"])
        self.click_like_human("button:has-text('Next')")

        # Google's UI may vary; wait for password field.
        page.wait_for_selector("input[type='password']", timeout=10000)
        self.type_like_human("input[type='password']", self.creds["password"])
        self.click_like_human("button:has-text('Next')")

        page.wait_for_load_state("networkidle")
        if self.is_logged_in():
            print("[Google] Login successful.")
        else:
            print("[Google] Login may have failed, CAPTCHA, or 2FA required.")
            print(f"[Google] Current URL: {page.url}")


if __name__ == "__main__":
    agent = GoogleAgent()
    agent.run()
