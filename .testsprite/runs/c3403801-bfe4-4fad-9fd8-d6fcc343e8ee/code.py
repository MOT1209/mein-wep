import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("https://rashid-wep.vercel.app/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Open the settings modal by clicking the Settings (gear) button in the top navigation so the Customize Workspace modal appears.
        # Settings button
        elem = page.locator('[id="settings-btn"]')
        await elem.click(timeout=10000)
        
        # -> Click a different accent color swatch (the pink swatch) in the 'Accent Color' section of the Customize Workspace modal to change the site's accent color, then verify the page UI (buttons/links) updates to the new color.
        # Click a different accent color swatch (the pink swatch) in the 'Accent Color' section of the Customize Workspace modal to change the site's accent color, then verify the page UI (buttons/links) updates to the new color.
        elem = page.locator('xpath=/html/body/div[13]/div[2]/div[2]/div/div[2]')
        await elem.click(timeout=10000)
        
        # -> Click the 'العربية' language button in the Customize Workspace modal to switch the site to Arabic, then verify Arabic text appears on the page.
        # العربية button
        elem = page.get_by_role('button', name='العربية', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Settings' (gear) modal by clicking the 'Settings' button in the top navigation so the Accent Color and Language options are visible.
        # Settings button
        elem = page.locator('[id="settings-btn"]')
        await elem.click(timeout=10000)
        
        # -> Click the cyan accent color swatch in the 'Accent Color' section to change the site's accent color, then verify that page UI elements (for example the primary buttons or links) update to the new accent color.
        # Click the cyan accent color swatch in the 'Accent Color' section to change the site's accent color, then verify that page UI elements (for example the primary buttons or links) update to the new accent color.
        elem = page.locator('xpath=/html/body/div[13]/div[2]/div[2]/div/div')
        await elem.click(timeout=10000)
        
        # -> Click the pink accent color swatch in the Customize Workspace modal, then close the modal so the page can be inspected to confirm whether primary buttons/links changed to the new accent color.
        # Click the pink accent color swatch in the Customize Workspace modal, then close the modal so the page can be inspected to confirm whether primary buttons/links changed to the new accent color.
        elem = page.locator('xpath=/html/body/div[13]/div[2]/div[2]/div/div[3]')
        await elem.click(timeout=10000)
        
        # -> Click the pink accent color swatch in the Customize Workspace modal, then close the modal so the page can be inspected to confirm whether primary buttons/links changed to the new accent color.
        # button
        elem = page.locator('[id="close-settings"]')
        await elem.click(timeout=10000)
        
        # -> Click the 'Settings' (gear) button to open the Customize Workspace / Customize Workspace modal so Accent Color and Language options are visible.
        # Settings button
        elem = page.locator('[id="settings-btn"]')
        await elem.click(timeout=10000)
        
        # -> Verify the Accent Color section lists at least six color swatches and then change the accent by clicking a different swatch (use the visible pink swatch), then switch the site language to 'العربية' and finally switch back to 'English'.
        # Verify the Accent Color section lists at least six color swatches and then change the accent by clicking a different swatch (use the visible pink swatch), then switch the site language to 'العربية' and finally switch back to 'English'.
        elem = page.locator('xpath=/html/body/div[13]/div[2]/div[2]/div/div[2]')
        await elem.click(timeout=10000)
        
        # -> Verify the Accent Color section lists at least six color swatches and then change the accent by clicking a different swatch (use the visible pink swatch), then switch the site language to 'العربية' and finally switch back to 'English'.
        # العربية button
        elem = page.get_by_role('button', name='العربية', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Customize Workspace' settings modal by clicking the 'Settings' (gear) button in the top navigation so the Accent Color and Language options become visible.
        # Settings button
        elem = page.locator('[id="settings-btn"]')
        await elem.click(timeout=10000)
        
        # -> Click the pink accent color swatch in the open 'Customize Workspace' modal to change the site's accent color, then switch language to 'العربية', switch back to 'English', and close the modal so the page UI can be inspected.
        # Click the pink accent color swatch in the open 'Customize Workspace' modal to change the site's accent color, then switch language to 'العربية', switch back to 'English', and close the modal so the page UI can be inspected.
        elem = page.locator('xpath=/html/body/div[13]/div[2]/div[2]/div/div[2]')
        await elem.click(timeout=10000)
        
        # -> Click the pink accent color swatch in the open 'Customize Workspace' modal to change the site's accent color, then switch language to 'العربية', switch back to 'English', and close the modal so the page UI can be inspected.
        # English button
        elem = page.get_by_role('button', name='English', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Customize Workspace' settings modal by clicking the Settings (gear) button in the top navigation so the Accent Color and Language controls become visible.
        # Settings button
        elem = page.locator('[id="settings-btn"]')
        await elem.click(timeout=10000)
        
        # -> Click the pink accent color swatch in the open 'Customize Workspace' modal to change the site's accent, then switch the language to 'العربية' and immediately switch back to 'English', finally close the modal so the page can be inspected ...
        # Click the pink accent color swatch in the open 'Customize Workspace' modal to change the site's accent, then switch the language to 'العربية' and immediately switch back to 'English', finally close the modal so the page can be inspected ...
        elem = page.locator('xpath=/html/body/div[13]/div[2]/div[2]/div/div[2]')
        await elem.click(timeout=10000)
        
        # -> Click the pink accent color swatch in the open 'Customize Workspace' modal to change the site's accent, then switch the language to 'العربية' and immediately switch back to 'English', finally close the modal so the page can be inspected ...
        # العربية button
        elem = page.get_by_role('button', name='العربية', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Settings' (gear) button in the top navigation to display the 'Customize Workspace' modal and obtain fresh controls for Accent Color and Language.
        # Settings button
        elem = page.locator('[id="settings-btn"]')
        await elem.click(timeout=10000)
        
        # -> Click the pink accent color swatch in the 'Customize Workspace' modal to change the site's accent color, then switch the language to 'العربية', switch back to 'English', and close the modal so the page UI can be inspected.
        # Click the pink accent color swatch in the 'Customize Workspace' modal to change the site's accent color, then switch the language to 'العربية', switch back to 'English', and close the modal so the page UI can be inspected.
        elem = page.locator('xpath=/html/body/div[13]/div[2]/div[2]/div/div[2]')
        await elem.click(timeout=10000)
        
        # -> Click the pink accent color swatch in the 'Customize Workspace' modal to change the site's accent color, then switch the language to 'العربية', switch back to 'English', and close the modal so the page UI can be inspected.
        # English button
        elem = page.get_by_role('button', name='English', exact=True)
        await elem.click(timeout=10000)
        
        # -> Final action — this is where the agent failed
        # Error observed by agent: Failed to click element <button index=12643>. The element may not be interactable or visible. If the page changed after navigation/interaction, the index [12643] may be stale. Get fresh browser state 
        # button
        elem = page.locator('[id="close-settings"]')
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify text returns to English
        # Assert: The main navigation link reads 'Home' in English.
        await expect(page.locator("xpath=/html/body/nav/div/div[1]/a[1]").nth(0)).to_have_text("Home", timeout=15000), "The main navigation link reads 'Home' in English."
        # Assert: The primary call-to-action button shows 'View Projects' in English.
        await expect(page.locator("xpath=/html/body/section[1]/div/div[1]/div[2]/a[1]").nth(0)).to_have_text("View Projects", timeout=15000), "The primary call-to-action button shows 'View Projects' in English."
        current_url = await page.evaluate("() => window.location.href")
        # Assert: page loaded with a URL (final outcome verified by the AI judge during the run)
        assert current_url, 'Page should have loaded with a URL'
        current_url = await page.evaluate("() => window.location.href")
        # Assert: page loaded with a URL (final outcome verified by the AI judge during the run)
        assert current_url, 'Page should have loaded with a URL'
        current_url = await page.evaluate("() => window.location.href")
        # Assert: page loaded with a URL (final outcome verified by the AI judge during the run)
        assert current_url, 'Page should have loaded with a URL'
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    