import asyncio
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

        # Navigate directly to farm game
        await page.goto("https://rashid-wep.vercel.app/games/farm-game/")
        await page.wait_for_load_state("domcontentloaded", timeout=10000)

        # Just verify the page loaded and has a title
        title = await page.title()
        assert len(title) > 0, "Page should have a title"
        
        # Verify body has content
        body = await page.inner_text("body")
        assert len(body) > 0, "Body should have content"
        
        # Log success
        print(f"Farm Game loaded successfully. Title: {title}")

        await asyncio.sleep(1)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
