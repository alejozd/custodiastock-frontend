import { test } from '@playwright/test';

test('Verify Stock Report and Kárdex Detail', async ({ page }) => {
  // Mock API for Login
  await page.route('**/api/auth/login', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'fake-jwt-token',
        user: { id: 1, username: 'admin', fullName: 'Administrador', role: 'ADMIN' }
      })
    });
  });

  // Mock API for Stock Report
  await page.route('**/api/products/stock-report*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 101, name: 'Laptop Pro 15', reference: 'LAP-001', totalEntries: 20, totalDeliveries: 5, stock: 15 },
        { id: 102, name: 'Monitor 4K 27"', reference: 'MON-027', totalEntries: 10, totalDeliveries: 12, stock: -2 },
        { id: 103, name: 'Teclado Mecánico', reference: 'KB-88', totalEntries: 50, totalDeliveries: 0, stock: 50 },
        { id: 104, name: 'Mouse Inalámbrico', reference: 'MS-W', totalEntries: 0, totalDeliveries: 0, stock: 0 }
      ])
    });
  });

  // Mock API for Product Movements
  await page.route('**/api/products/101/movements*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 1,
          type: 'ENTRY',
          quantity: 20,
          date: '2024-03-01T10:00:00',
          documentNumber: 'ENT-001',
          details: 'Compra inicial',
          user: 'admin'
        },
        {
          id: 2,
          type: 'DELIVERY',
          quantity: 5,
          date: '2024-03-05T15:30:00',
          documentNumber: 'DEL-001',
          details: 'Entrega a departamento IT',
          user: 'admin'
        }
      ])
    });
  });

  // Go to Login
  await page.goto('http://localhost:5173/login');
  await page.fill('input[placeholder="usuario.admin"]', 'admin');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');

  // Wait for Navigation to Dashboard or Products (default)
  await page.waitForURL(url => url.pathname !== '/login');

  // Navigate to Stock Report
  await page.goto('http://localhost:5173/reporte-stock');
  await page.waitForSelector('.p-datatable');

  // Take screenshot of the report table
  await page.screenshot({ path: 'verify_stock_report_table.png', fullPage: true });

  // Open Detail Dialog for Laptop Pro 15
  const row = page.locator('tr', { hasText: 'Laptop Pro 15' });
  await row.locator('button.p-button-info').click();

  // Wait for Dialog
  await page.waitForSelector('.modern-dialog');
  await page.waitForTimeout(500); // Wait for animations

  // Take screenshot of the detail dialog
  await page.screenshot({ path: 'verify_stock_report_detail.png' });

  console.log('Stock Report Verification complete. Screenshots saved.');
});
