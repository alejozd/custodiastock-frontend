import { test, expect } from '@playwright/test';

test('Verify Deliveries Search Filter', async ({ page }) => {
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  // Mock API for Login
  await page.route('**/api/auth/login', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'fake-jwt-token',
        user: { id: 1, username: 'alejo', fullName: 'Alejandro', role: 'ADMIN' }
      })
    });
  });

  // Mock API for Deliveries
  await page.route('**/api/deliveries*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: 1,
            productId: 1,
            product: { name: 'Escritorio Oficina', reference: 'ESC-001' },
            quantity: 7,
            documentNumber: 'ENT-000003',
            deliveredBy: { fullName: 'Alejandro' },
            receivedBy: { fullName: 'Diego Zambrano' },
            status: 'ACTIVE',
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            productId: 2,
            product: { name: 'DVR Seguridad', reference: 'DVR-999' },
            quantity: 2,
            documentNumber: 'ENT-000002',
            deliveredBy: { fullName: 'Alejandro' },
            receivedBy: { fullName: 'Diego Zambrano' },
            status: 'ACTIVE',
            createdAt: new Date().toISOString()
          }
        ]
      })
    });
  });

  // 1. Login Page
  await page.goto('http://localhost:5173/login');
  await page.fill('input[placeholder="usuario.admin"]', 'alejo');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');

  // 2. Navigation to Deliveries
  await page.waitForURL('**/dashboard');
  await page.click('text=Entregas');
  await page.waitForURL('**/entregas');

  await page.waitForSelector('.p-datatable');

  // Verify initial rows
  const initialRows = await page.locator('.p-datatable-tbody > tr').count();
  console.log(`Initial rows: ${initialRows}`);

  // 3. Search for "DVR"
  await page.fill('#search', 'dvr');

  // Wait for filter to apply (it's immediate in PrimeReact)
  await page.waitForTimeout(500);

  const filteredRows = await page.locator('.p-datatable-tbody > tr').count();
  console.log(`Filtered rows for "dvr": ${filteredRows}`);

  await page.screenshot({ path: 'verify_filter_search.png' });

  expect(filteredRows).toBe(1);
  await expect(page.locator('text=DVR Seguridad')).toBeVisible();
  await expect(page.locator('text=Escritorio Oficina')).not.toBeVisible();

  console.log('Search filter verification complete.');
});
