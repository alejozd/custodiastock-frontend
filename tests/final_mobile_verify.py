import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async_playwright_instance = await async_playwright().start()
    browser = await async_playwright_instance.chromium.launch(headless=True)

    # Simular iPhone 12
    context = await browser.new_context(
        viewport={'width': 390, 'height': 844},
        user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1'
    )

    page = await context.new_page()

    # Inyectar localStorage para saltar login
    await page.goto("http://localhost:5173/")
    await page.evaluate("""
        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('currentUser', JSON.stringify({id: 1, username: 'admin', role: 'ADMIN', fullName: 'Administrador'}));
    """)
    await page.reload()

    os.makedirs("verification-results", exist_ok=True)

    pages_to_verify = [
        ("usuarios", "users"),
        ("productos", "products"),
        ("entregas", "deliveries"),
        ("entradas", "entries"),
        ("reporte-stock", "stock")
    ]

    for route, name in pages_to_verify:
        url = f"http://localhost:5173/{route}"
        print(f"Verificando {url}...")
        try:
            await page.goto(url)
            # Esperar a que la tabla o el cargando desaparezca
            await asyncio.sleep(2)
            await page.screenshot(path=f"verification-results/mobile_{name}_final.png")
        except Exception as e:
            print(f"Error en {url}: {e}")

    await browser.close()
    await async_playwright_instance.stop()

if __name__ == "__main__":
    asyncio.run(run())
