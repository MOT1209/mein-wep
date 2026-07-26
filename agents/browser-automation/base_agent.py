"""Base browser agent with session persistence and human-like behaviour.

All site-specific agents should inherit from ``BaseBrowserAgent`` and implement
``execute_task(page)``. The base class handles launching the browser, loading
saved sessions, and saving sessions back after the task finishes.
"""
from __future__ import annotations

import abc
import random
from pathlib import Path
from typing import Optional

from playwright.sync_api import Browser, BrowserContext, Page, sync_playwright

try:
    from config import Config
    from human_actions import HumanActions
    from session_manager import SessionManager
except ImportError:
    # Support running from within the agents/browser-automation directory.
    from .config import Config
    from .human_actions import HumanActions
    from .session_manager import SessionManager


class BaseBrowserAgent(abc.ABC):
    """Abstract base class for automating a website.

    Subclasses must implement ``execute_task(page)``.
    """

    def __init__(
        self,
        site_name: str,
        start_url: str,
        headless: bool | None = None,
        slow_mo_ms: int | None = None,
        session_dir: str | Path | None = None,
    ) -> None:
        self.site_name = site_name
        self.start_url = start_url
        self.config = Config()

        self.headless = headless if headless is not None else self.config.headless
        slow_mo = slow_mo_ms if slow_mo_ms is not None else self.config.slow_mo
        self.human = HumanActions(slow_mo_ms=slow_mo)

        self.session = SessionManager(base_dir=session_dir)
        self._browser: Optional[Browser] = None
        self._context: Optional[BrowserContext] = None
        self._page: Optional[Page] = None

    # ------------------------------------------------------------------
    # Context manager support
    # ------------------------------------------------------------------
    def __enter__(self) -> "BaseBrowserAgent":
        self.start()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:  # type: ignore[return]
        self.stop(save_session=True)

    # ------------------------------------------------------------------
    # Browser lifecycle
    # ------------------------------------------------------------------
    def start(self) -> "BaseBrowserAgent":
        """Launch the browser, load any saved session, and open the start URL."""
        if self._browser is not None:
            return self

        playwright = sync_playwright().start()
        self._playwright = playwright

        # Randomised desktop viewport to look less bot-like.
        viewport = self.human.random_viewport_size()
        self._browser = playwright.chromium.launch(
            headless=self.headless,
            slow_mo=self.human.slow_mo_ms,
        )

        context_kwargs = {
            "viewport": viewport,
            "locale": "en-US",
            "timezone_id": "UTC",
            "record_video_dir": None,
        }
        self._context = self._browser.new_context(**context_kwargs)  # type: ignore[arg-type]

        # Try to load a previous session; if it works, the page will already be logged in.
        if self.session.exists(self.site_name):
            self._context.set_storage_state(path=str(self.session._session_path(self.site_name)))

        self._page = self._context.new_page()
        self._page.goto(self.start_url, wait_until="domcontentloaded")
        return self

    def stop(self, save_session: bool = True) -> None:
        """Close the browser and optionally save the current session."""
        if save_session and self._context is not None:
            try:
                self.session.save(self._context, self.site_name)
            except Exception:
                pass

        if self._page is not None:
            self._page.close()
            self._page = None
        if self._context is not None:
            self._context.close()
            self._context = None
        if self._browser is not None:
            self._browser.close()
            self._browser = None
        if hasattr(self, "_playwright"):
            self._playwright.stop()

    @property
    def page(self) -> Page:
        """Return the active Playwright page, raising if not started."""
        if self._page is None:
            raise RuntimeError("Browser not started. Call .start() or use a context manager.")
        return self._page

    # ------------------------------------------------------------------
    # Human-like helpers exposed on the base class
    # ------------------------------------------------------------------
    def delay(self, min_ms: int | float = 200, max_ms: int | float = 1200) -> None:
        self.human.delay(min_ms, max_ms)

    def type_like_human(self, locator_or_selector: str, text: str) -> None:
        """Type into an element selected by a CSS selector or Locator."""
        from playwright.sync_api import Locator
        if isinstance(locator_or_selector, Locator):
            locator = locator_or_selector
        else:
            locator = self.page.locator(locator_or_selector)
        self.human.type_text(locator, text)

    def click_like_human(self, locator_or_selector: str) -> None:
        from playwright.sync_api import Locator
        if isinstance(locator_or_selector, Locator):
            locator = locator_or_selector
        else:
            locator = self.page.locator(locator_or_selector)
        self.human.click(locator)

    def scroll_down(self, amount: int | None = None) -> None:
        self.human.scroll_page(self.page, "down", amount)

    def scroll_up(self, amount: int | None = None) -> None:
        self.human.scroll_page(self.page, "up", amount)

    def simulate_reading(self, scrolls: int = 2) -> None:
        self.human.simulate_reading(self.page, scrolls)

    # ------------------------------------------------------------------
    # High-level API
    # ------------------------------------------------------------------
    def is_logged_in(self) -> bool:
        """Return True if the saved session made the page already logged in.

        Subclasses can override this with a site-specific check.
        """
        return False

    def run(self) -> None:
        """Start the browser and execute the agent's task."""
        self.start()
        try:
            self.execute_task(self.page)
            # Give the page a moment to settle before saving session.
            self.delay(500, 1500)
        finally:
            self.stop(save_session=True)

    @abc.abstractmethod
    def execute_task(self, page: Page) -> None:
        """Implement the site-specific automation here."""
        raise NotImplementedError("Subclasses must implement execute_task(page).")
