"""Helpers that make Playwright interactions look more human.

Includes randomised delays, natural typing cadence, mouse movement, scrolling,
and small randomisations of viewport/behaviour.
"""
from __future__ import annotations

import random
import time
from typing import Optional

from playwright.sync_api import Locator, Page


class HumanActions:
    """Mixin-style class for adding human-like behaviour to a browser agent."""

    def __init__(self, slow_mo_ms: int = 100) -> None:
        self.slow_mo_ms = max(0, slow_mo_ms)

    def delay(self, min_ms: int | float = 200, max_ms: int | float = 1200) -> None:
        """Wait for a random duration to simulate human reaction time."""
        min_ms = max(0, min_ms)
        max_ms = max(min_ms, max_ms)
        time.sleep(random.uniform(min_ms, max_ms) / 1000.0)

    def short_pause(self) -> None:
        """Very short pause, useful between keypresses."""
        time.sleep(random.uniform(0.03, 0.18))

    def type_text(self, locator: Locator, text: str) -> None:
        """Type text like a human with variable speed and occasional pauses."""
        for i, char in enumerate(text):
            locator.type(char, delay=random.randint(20, 80))
            if i % random.randint(3, 7) == 0:
                self.short_pause()
        self.delay(150, 400)

    def click(self, locator: Locator) -> None:
        """Click with a small pre-click delay."""
        self.delay(100, 400)
        locator.click()
        self.delay(200, 600)

    def scroll_page(self, page: Page, direction: str = "down", amount: int | None = None) -> None:
        """Scroll the page in a human-like way.

        Args:
            direction: 'down' or 'up'.
            amount: pixels to scroll. If None, a random amount is used.
        """
        if amount is None:
            amount = random.randint(300, 900)
        if direction == "up":
            amount = -amount
        page.mouse.wheel(0, amount)
        self.delay(300, 800)

    def move_mouse_randomly(self, page: Page) -> None:
        """Move mouse to a random point within the viewport."""
        viewport = page.viewport_size
        if viewport is None:
            return
        width = viewport.get("width", 1280)
        height = viewport.get("height", 720)
        x = random.randint(width // 10, width - width // 10)
        y = random.randint(height // 10, height - height // 10)
        page.mouse.move(x, y)
        self.delay(50, 200)

    def random_viewport_size(self) -> dict[str, int]:
        """Return a common desktop viewport size.

        This makes automation slightly less predictable.
        """
        sizes = [
            {"width": 1280, "height": 720},
            {"width": 1366, "height": 768},
            {"width": 1440, "height": 900},
            {"width": 1920, "height": 1080},
        ]
        return random.choice(sizes)

    def simulate_reading(self, page: Page, scrolls: int = 2) -> None:
        """Scroll a few times as if reading the page."""
        for _ in range(scrolls):
            self.scroll_page(page)
        self.delay(800, 2000)
