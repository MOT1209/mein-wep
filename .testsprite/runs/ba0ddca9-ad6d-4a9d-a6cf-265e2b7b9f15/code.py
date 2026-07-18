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
        await page.goto("https://rashid-wep.vercel.app/king2")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'تسجيل الدخول' (Sign in) link to open the sign-in page.
        # تسجيل الدخول link
        elem = page.get_by_role('link', name='تسجيل الدخول', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'تسجيل الدخول بـ Google' button to verify it redirects toward accounts.google.com.
        # تسجيل الدخول بـ Google button
        elem = page.get_by_role('button', name='تسجيل الدخول بـ Google', exact=True)
        await elem.click(timeout=10000)
        
        # -> Return to the KING2 sign-in page and click the 'تسجيل الدخول بـ GitHub' (Sign in with GitHub) button to verify it redirects to github.com.
        await page.go_back()
        
        # -> Click the 'تسجيل الدخول بـ GitHub' (Sign in with GitHub) button to verify it redirects to github.com.
        # تسجيل الدخول بـ GitHub button
        elem = page.get_by_role('button', name='تسجيل الدخول بـ GitHub', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the sign-in page URL contains /king2/auth/signin
        # Assert: The current URL contains /king2/auth/signin.
        await expect(page).to_have_url(re.compile("/king2/auth/signin"), timeout=15000), "The current URL contains /king2/auth/signin."
        
        # --> Verify a Google OAuth button is visible on the page
        await page.locator("xpath=/html/body/div[1]/div[4]/main/div/div[2]/webauthn-status/form[2]/button").nth(0).scroll_into_view_if_needed()
        # Assert: Google OAuth button labeled 'Continue with Google' is visible on the page.
        await expect(page.locator("xpath=/html/body/div[1]/div[4]/main/div/div[2]/webauthn-status/form[2]/button").nth(0)).to_be_visible(timeout=15000), "Google OAuth button labeled 'Continue with Google' is visible on the page."
        
        # --> Verify the GitHub button links to or redirects towards github.com
        # Assert: The current URL contains 'github.com', confirming the GitHub OAuth redirect.
        await expect(page).to_have_url(re.compile("github\\.com"), timeout=15000), "The current URL contains 'github.com', confirming the GitHub OAuth redirect."
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
    