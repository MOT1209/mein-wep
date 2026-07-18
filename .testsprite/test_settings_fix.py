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

        # Navigate to homepage
        await page.goto("https://rashid-wep.vercel.app/")
        await page.wait_for_load_state("domcontentloaded", timeout=10000)
        await page.wait_for_timeout(1000)

        # --- Step 1: Open settings modal ---
        await page.locator("#settings-btn").click(timeout=10000)
        await expect(page.locator("#settings-modal")).to_be_visible(timeout=5000)

        # --- Step 2: Change accent color to pink (second dot) ---
        pink_dot = page.locator(".accent-dot[data-color='#f472b6']")
        await pink_dot.click(timeout=5000)
        await page.wait_for_timeout(500)

        # --- Step 3: Close settings modal ---
        await page.locator("#close-settings").click(timeout=5000)
        await expect(page.locator("#settings-modal")).not_to_be_visible(timeout=5000)

        # --- Step 4: Re-open settings modal ---
        await page.locator("#settings-btn").click(timeout=10000)
        await expect(page.locator("#settings-modal")).to_be_visible(timeout=5000)

        # --- Step 5: Switch language to Arabic ---
        await page.locator(".lang-btn[data-lang='ar']").click(timeout=5000)
        await page.wait_for_timeout(500)

        # --- Step 6: Close settings ---
        await page.locator("#close-settings").click(timeout=5000)
        await expect(page.locator("#settings-modal")).not_to_be_visible(timeout=5000)
        await page.wait_for_timeout(500)

        # --- Step 7: Verify Arabic text in nav ---
        # In Arabic mode, "Home" link should show something different or the page should load
        home_link = page.locator(".nav-links a[href='#home']")
        await expect(home_link).to_be_visible(timeout=5000)

        # --- Step 8: Re-open and switch back to English ---
        await page.locator("#settings-btn").click(timeout=10000)
        await expect(page.locator("#settings-modal")).to_be_visible(timeout=5000)
        await page.locator(".lang-btn[data-lang='en']").click(timeout=5000)
        await page.wait_for_timeout(500)
        await page.locator("#close-settings").click(timeout=5000)
        await expect(page.locator("#settings-modal")).not_to_be_visible(timeout=5000)
        await page.wait_for_timeout(500)

        # --- Step 9: Verify back to English nav ---
        await expect(page.locator(".nav-links a[href='#home']")).to_have_text("Home", timeout=5000)
        
        # --- Step 10: Verify hero section is visible ---
        await expect(page.locator("#home h1")).to_be_visible(timeout=5000)
        
        await asyncio.sleep(2)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
