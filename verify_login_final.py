import asyncio
from playwright.async_api import async_playwright
import os

async def verify_login_final():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 720})
        page = await context.new_page()

        # Navigate to login page
        url = "http://127.0.0.1:5173/login"
        print(f"Navigating to {url}...")
        try:
            await page.goto(url, wait_until="networkidle", timeout=60000)
        except Exception as e:
            print(f"Navigation failed: {e}")
            await page.screenshot(path="navigation_error.png")
            await browser.close()
            return

        print("Page title:", await page.title())

        # Wait for any input to ensure hydration
        try:
            await page.wait_for_selector("input", timeout=10000)
        except:
            print("No input found within 10s")
            print("Current URL:", page.url)
            await page.screenshot(path="no_input_found.png")
            # Log body content
            content = await page.content()
            with open("page_content_debug.html", "w") as f:
                f.write(content)
            await browser.close()
            return

        # 1. Verify Widths
        username_field = page.locator("input#username")
        password_field = page.locator("input.p-password-input")

        if await username_field.count() == 0:
            print("Username field NOT found by #username. Content might not be fully loaded or selector is wrong.")
            # Try finding by placeholder
            username_field = page.get_by_placeholder("Usuario")

        if await password_field.count() == 0:
             password_field = page.locator(".p-password input")

        u_box = await username_field.bounding_box()
        p_box = await password_field.bounding_box()

        if u_box and p_box:
            print(f"Username width: {u_box['width']}")
            print(f"Password width: {p_box['width']}")
            if abs(u_box['width'] - p_box['width']) < 5:
                print("SUCCESS: Widths are approximately equal.")
            else:
                print(f"FAILURE: Widths differ significantly: {u_box['width']} vs {p_box['width']}")
        else:
            print(f"FAILURE: Could not get bounding boxes. U: {u_box}, P: {p_box}")

        # 2. Verify Eye Icon (Toggle Mask)
        # Based on DOM dump, it's an SVG inside p-icon-field-right
        toggle_icon = page.locator('.p-icon-field-right svg[role="switch"]')
        if await toggle_icon.count() > 0:
            print("SUCCESS: Eye icon (toggle mask) found.")

            # Check if it works
            await password_field.fill("Secret123")
            print("Initial input type:", await password_field.get_attribute("type"))

            await toggle_icon.click()
            await page.wait_for_timeout(500)
            print("Input type after click:", await password_field.get_attribute("type"))

            if await password_field.get_attribute("type") == "text":
                print("SUCCESS: Password visibility toggled to text.")
            else:
                print("FAILURE: Password visibility did not toggle to text.")
        else:
            print("FAILURE: Eye icon (toggle mask) NOT found.")
            # List all SVGs for debugging
            svg_count = await page.locator("svg").count()
            print(f"Total SVGs on page: {svg_count}")

        await page.screenshot(path="final_login_verification_v2.png")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_login_final())
