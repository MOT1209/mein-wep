import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        pw = await async_api.async_playwright().start()
        browser = await pw.chromium.launch(
            headless=True,
            args=["--window-size=1280,720", "--disable-dev-shm-usage", "--ipc=host", "--single-process"],
        )
        context = await browser.new_context()
        context.set_default_timeout(15000)
        page = await context.new_page()

        # Navigate to games page
        await page.goto("https://rashid-wep.vercel.app/games/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass

        # Verify games page title/heading
        await expect(page.locator("h1").first).to_be_visible(timeout=10000)
        
        # Verify game links are present
        await expect(page.locator('a[href*="farm-game"]').first).to_be_visible(timeout=10000)
        await expect(page.locator('a[href*="kingcraft-game"]').first).to_be_visible(timeout=10000)
        await expect(page.locator('a[href*="rust-game"]').first).to_be_visible(timeout=10000)
        
        # Verify back to home link
        await expect(page.locator('a[href*="../index.html"]').first).to_be_visible(timeout=10000)

        await asyncio.sleep(2)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
