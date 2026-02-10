import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { Role, User } from '../src/service/pizzaService';

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = { 'f@jwt.com': { id: '3', name: 'Orem', email: 'f@jwt.com', password: 'f', roles: [{ role: Role.Franchisee }] } };
  
  // Track stores in state so they persist across API calls
  let franchise = { id: '3', name: 'MyFranchise', stores: [{ id: '10', name: 'Main St' }] };
  
  await page.route('*/**/api/auth', async (route) => {
    if (route.request().method() === 'DELETE') {
      loggedInUser = undefined;
      await route.fulfill({ status: 200 });
      return;
    }
    const loginReq = route.request().postDataJSON();
    const user = validUsers[loginReq.email];
    if (!user || user.password !== loginReq.password) {
      await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
      return;
    }
    loggedInUser = validUsers[loginReq.email];
    const loginRes = {
      user: loggedInUser,
      token: 'abcdef',
    };
    expect(route.request().method()).toBe('PUT');
    await route.fulfill({ json: loginRes });
  });

  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  // Standard menu (may be used by other flows)
  await page.route('*/**/api/order/menu', async (route) => {
    expect(route.request().method()).toBe('GET');
    const menuRes = [
      { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
    ];
    await route.fulfill({ json: menuRes });
  });

  // Orders endpoints
  await page.route('*/**/api/order', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      const orders = { id: 1, dinerId: '3', orders: [] };
      await route.fulfill({ json: orders });
      return;
    }
    if (method === 'POST') {
      const orderReq = route.request().postDataJSON();
      const orderRes = { order: { ...orderReq, id: 23 }, jwt: 'eyJpYXQ' };
      await route.fulfill({ json: orderRes });
      return;
    }
    await route.fulfill({ status: 200 });
  });

  // Verify order (factory)
  await page.route('*/**/api/order/verify', async (route) => {
    expect(route.request().method()).toBe('POST');
    await route.fulfill({ json: { message: 'ok', payload: 'data' } });
  });

  // Franchises: single-franchise for franchisee and list queries
  // Handle GET /api/franchise?... (list with query params)
  await page.route('*/**/api/franchise?*', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      const franchiseRes = { franchises: [], more: false };
      await route.fulfill({ json: franchiseRes });
      return;
    }
    if (method === 'POST') {
      const body = route.request().postDataJSON();
      const created = { ...body, id: '99' };
      await route.fulfill({ json: created });
      return;
    }
  });

  // Handle GET /api/franchise/* (user's franchises by ID)
  await page.route('*/**/api/franchise/*', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      // GET /api/franchise/:id - returns array with current franchise state
      const franchises = [franchise];
      await route.fulfill({ json: franchises });
      return;
    }
    if (method === 'DELETE') {
      await route.fulfill({ status: 200 });
      return;
    }
    await route.fulfill({ status: 200 });
  });

  // Create/close store
  await page.route(/\/api\/franchise\/.+\/store(\/.*)?$/, async (route) => {
    const method = route.request().method();
    const url = route.request().url();
    console.log(`🔷 Store route: ${method} ${url}`);
    
    if (method === 'POST') {
      const body = route.request().postDataJSON();
      const newStore = { ...body, id: String(Date.now()) };
      console.log(`  ➕ Creating store:`, newStore.name);
      // Add store to franchise's stores list
      franchise.stores = [...(franchise.stores || []), newStore];
      console.log(`  📋 Franchise now has stores:`, franchise.stores.map(s => s.name));
      await route.fulfill({ json: newStore });
      return;
    }
    if (method === 'DELETE') {
      // Remove store from franchise's stores list
      const urlParts = url.split('/');
      const storeId = urlParts[urlParts.length - 1];
      console.log(`  ❌ Closing store ID: ${storeId}`);
      console.log(`  📋 Stores before delete:`, franchise.stores.map(s => ({ id: s.id, name: s.name })));
      franchise.stores = (franchise.stores || []).filter(s => s.id !== storeId);
      console.log(`  📋 Stores after delete:`, franchise.stores.map(s => ({ id: s.id, name: s.name })));
      await route.fulfill({ status: 200 });
      return;
    }
    await route.fulfill({ status: 200 });
  });

  // Docs
  await page.route('*/**/api/docs', async (route) => {
    await route.fulfill({ json: { endpoints: [] } });
  });

  await page.goto('/');

}

test('login as franchisee', async ({ page }) => {
  await basicInit(page);
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('f');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('link', { name: /^O$/ })).toBeVisible();
});

test('franchisee can view franchise dashboard', async ({ page }) => {
  await basicInit(page);
  
  // Login as franchisee
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('f');
  await page.getByRole('button', { name: 'Login' }).click();

  // Wait for login to complete (user avatar visible)
  await expect(page.getByRole('link', { name: /^O$/ })).toBeVisible();

  // Navigate to franchise dashboard
  await page.goto('/franchise-dashboard');
  
  // Verify franchise dashboard displays with franchise data
  await expect(page.locator('body')).toContainText('MyFranchise');
  await expect(page.locator('table')).toContainText('Main St');
});

test('create new store', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('f');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
  await page.getByRole('button', { name: 'Create store' }).click();
  await page.getByRole('textbox', { name: 'store name' }).click();
  await page.getByRole('textbox', { name: 'store name' }).fill('test');
  await page.getByRole('button', { name: 'Create' }).click();
  
  // Verify new store appears in dashboard
  await expect(page.locator('table')).toContainText('test');
});

test('close store', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('f');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
  await expect(page.locator('table')).toContainText('Main St');
  await page.locator('button:has-text("Close")').first().click();
  await expect(page.getByText('Sorry to see you go')).toBeVisible();
  
  // wait for delete
  const deleteResponse = page.waitForResponse(response => 
    response.url().includes('/api/franchise/') && 
    response.url().includes('/store/') && 
    response.request().method() === 'DELETE'
  );
  
  await page.getByRole('button').filter({ hasText: /^Close$/ }).first().click();
  await deleteResponse;
  await page.waitForTimeout(500);
  await page.goto('/franchise-dashboard');
  
  await expect(page.locator('table')).not.toContainText('Main St');
});
