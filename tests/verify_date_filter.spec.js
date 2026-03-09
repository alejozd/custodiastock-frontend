import { test, expect } from '@playwright/test';

test('Verify Deliveries Date Filter', async ({ page }) => {
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  let lastApiParams = {};

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
    const url = new URL(route.request().url());
    lastApiParams = Object.fromEntries(url.searchParams);
    console.log('API call params:', lastApiParams);

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
            createdAt: '2024-05-10T10:00:00.000Z'
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

  // 3. Select Start Date
  // Open calendar (first one after 'Buscar Producto' label)
  const calendars = page.locator('.p-calendar input');
  await calendars.first().click();
  // Select current day (simpler than specific day for now)
  await page.click('.p-datepicker-today');

  // 4. Select End Date
  await calendars.last().click();
  await page.click('.p-datepicker-today');

  // 5. Click "Filtrar"
  await page.click('button:has-text("Filtrar")');

  // Wait for the API call to be intercepted
  await page.waitForTimeout(500);

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const expectedDate = `${year}-${month}-${day}`;

  console.log(`Expected date format: ${expectedDate}`);
  console.log(`API startDate: ${lastApiParams.startDate}`);
  console.log(`API endDate: ${lastApiParams.endDate}`);

  expect(lastApiParams.startDate).toBe(expectedDate);
  expect(lastApiParams.endDate).toBe(expectedDate);

  await page.screenshot({ path: 'verify_date_filter.png' });

  console.log('Date filter verification complete.');
});
