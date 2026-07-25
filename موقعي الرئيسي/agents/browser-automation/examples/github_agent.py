"""Example agent that logs into GitHub and prints the dashboard title.

Usage:
    python agents/browser-automation/examples/github_agent.py

Required env vars (set in agents/browser-automation/.env):
    GITHUB_EMAIL
    GITHUB_PASSWORD
"""
from __future__ import annotations

import sys
from pathlib import Path

# Allow running this file directly from the repo root.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from base_agent import BaseBrowserAgent
from auth_manager import AuthManager


class GitHubAgent(BaseBrowserAgent):
    """Automates GitHub login and basic navigation."""

    def __init__(self) -> None:
        super().__init__(site_name="github", start_url="https://github.com/login")
        self.creds = AuthManager().get("github")

    def is_logged_in(self) -> bool:
        return self.page.locator("a[href='/new'][title='Create new...']").count() > 0 or \
               self.page.locator(".AppHeader-context").count() > 0

    def execute_task(self, page) -> None:
        if "github.com" not in page.url:
            page.goto("https://github.com/login", wait_until="domcontentloaded")

        if self.is_logged_in():
            print("[GitHub] Already logged in via saved session.")
            page.goto("https://github.com", wait_until="networkidle")
            print(f"[GitHub] Dashboard title: {page.title()}")
            return

        print("[GitHub] Logging in with email/password...")
        self.type_like_human("#login_field", self.creds["email"])
        self.type_like_human("#password", self.creds["password"])
        self.click_like_human("input[type='submit']")

        page.wait_for_load_state("networkidle")
        if self.is_logged_in():
            print("[GitHub] Login successful.")
            print(f"[GitHub] Dashboard title: {page.title()}")
        else:
            print("[GitHub] Login may have failed or 2FA is required.")
            print(f"[GitHub] Current URL: {page.url}")


if __name__ == "__main__":
    agent = GitHubAgent()
    agent.run()
