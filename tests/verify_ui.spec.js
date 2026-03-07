import { test } from '@playwright/test';

test('Verify Dashboard and UI improvements', async ({ page }) => {
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

  // Mock API for Dashboard Stats
  await page.route('**/api/dashboard/stats', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          totalProducts: 150,
          totalUsers: 12,
          pendingDeliveries: 5,
          completedDeliveries: 1240
        }
      })
    });
  });

  // Mock API for Users
  await page.route('**/api/users', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          { id: 1, username: 'admin', fullName: 'Alejandro Admin', email: 'admin@test.com', role: 'ADMIN', active: true },
          { id: 2, username: 'user1', fullName: 'Test User', email: 'user@test.com', role: 'OPERATOR', active: false }
        ]
      })
    });
  });

  // Mock API for Products
  await page.route('**/api/products', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          { id: 1, name: 'Test Product', reference: 'REF123', description: 'Test description', active: true }
        ]
      })
    });
  });

  // Mock API for Deliveries
  await page.route('**/api/deliveries', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: 1,
            productId: 1,
            product: { name: 'Test Product' },
            quantity: 10,
            deliveredBy: { fullName: 'Admin' },
            receivedBy: { fullName: 'User' },
            status: 'DELIVERED',
            createdAt: new Date().toISOString()
          }
        ]
      })
    });
  });

  // 1. Login Page
  await page.goto('http://localhost:5173/login');
  await page.waitForSelector('.modern-input', { timeout: 10000 });
  await page.fill('input[placeholder="usuario.admin"]', 'alejo');
  await page.fill('input[type="password"]', 'password');
  await page.screenshot({ path: 'verify_login.png' });
  await page.click('button[type="submit"]');

  // 2. Dashboard
  await page.waitForURL('**/dashboard');
  await page.waitForSelector('.kpi-card');
  await page.screenshot({ path: 'verify_dashboard.png' });

  // 3. Navigation to Users
  await page.click('text=Usuarios');
  await page.waitForURL('**/usuarios');
  await page.waitForSelector('.p-datatable');
  await page.screenshot({ path: 'verify_users.png' });

  // Open User Dialog to verify icons
  await page.click('text=Nuevo Usuario');
  await page.waitForSelector('.user-dialog');
  await page.screenshot({ path: 'verify_user_dialog.png' });
  await page.click('text=Cancelar');

  // 4. Navigation to Products
  await page.click('text=Productos');
  await page.waitForURL('**/productos');
  await page.waitForSelector('.p-datatable');
  await page.screenshot({ path: 'verify_products.png' });

  // 5. Navigation to Deliveries
  await page.click('text=Entregas');
  await page.waitForURL('**/entregas');
  await page.waitForSelector('.p-datatable');
  await page.screenshot({ path: 'verify_deliveries.png' });

  console.log('UI Verification complete. Screenshots saved.');
});
