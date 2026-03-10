import { test, expect } from '@playwright/test';

test('Verify Entries Module', async ({ page }) => {
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  // Mock API for Login
  await page.route('**/api/auth/login', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'fake-jwt-token',
        user: { id: 1, username: 'admin', fullName: 'Alejandro Admin', role: 'ADMIN' }
      })
    });
  });

  // Mock API for Entries List
  await page.route('**/api/entries', async route => {
    const url = route.request().url();
    const method = route.request().method();

    if (method === 'GET' && !url.includes('/entries/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 1,
              documentNumber: 'ENTR-000001',
              productId: 1,
              product: { name: 'Test Product', reference: 'REF123' },
              quantity: 10,
              userId: 1,
              createdBy: { fullName: 'Alejandro Admin' },
              entryDate: new Date().toISOString(),
              status: 'ACTIVE',
              createdAt: new Date().toISOString()
            }
          ]
        })
      });
    } else if (method === 'GET' && url.includes('/entries/1')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 1,
            documentNumber: 'ENTR-000001',
            productId: 1,
            product: { name: 'Test Product', reference: 'REF123' },
            quantity: 10,
            userId: 1,
            createdBy: { fullName: 'Alejandro Admin' },
            entryDate: new Date().toISOString(),
            status: 'ACTIVE',
            createdAt: new Date().toISOString()
          }
        })
      });
    } else {
      await route.continue();
    }
  });

  // Mock API for Next Number
  await page.route('**/api/entries/next-number', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ nextNumber: 'ENTR-000002' })
    });
  });

  // Mock API for Products
  await page.route('**/api/products', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          { id: 1, name: 'Test Product', reference: 'REF123', active: true }
        ]
      })
    });
  });

  // 1. Login
  await page.goto('http://localhost:5173/login');
  await page.fill('input[placeholder="usuario.admin"]', 'admin');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');

  // 2. Navigate to Entries
  await page.waitForURL('**/dashboard');
  await page.click('text=Entradas');
  await page.waitForURL('**/entradas');
  await expect(page.locator('text=Historial de Entradas')).toBeVisible();
  await expect(page.locator('text=ENTR-000001')).toBeVisible();
  await page.screenshot({ path: 'entries_list.png' });

  // 3. Open Entry Detail
  await page.locator('.pi-eye').first().click();
  await page.waitForSelector('text=Detalle de Entrada de Inventario', { timeout: 10000 });
  await expect(page.locator('text=Detalle de Entrada de Inventario')).toBeVisible();
  await page.screenshot({ path: 'entry_detail.png' });
  await page.click('text=Cerrar');

  // 4. Navigate to New Entry
  await page.click('text=Nueva Entrada');
  await page.waitForURL('**/nueva-entrada');
  await expect(page.locator('text=Nueva Entrada de Inventario')).toBeVisible();
  await expect(page.locator('#documentNumber')).toHaveValue('ENTR-000002');
  await page.screenshot({ path: 'new_entry_form.png' });

  // 5. Fill New Entry Form
  await page.fill('#producto input', 'Test');
  await page.click('text=Test Product');
  await page.fill('#cantidad input', '5');
  await page.screenshot({ path: 'new_entry_filled.png' });

  console.log('Entries Module verification complete.');
});
