import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { Role, User } from '../src/service/pizzaService';


export async function franchiseInit(page: Page) {
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
    
    if (method === 'POST') {
      const body = route.request().postDataJSON();
      const newStore = { ...body, id: String(Date.now()) };
      franchise.stores = [...(franchise.stores || []), newStore];
      await route.fulfill({ json: newStore });
      return;
    }
    if (method === 'DELETE') {
      const urlParts = url.split('/');
      const storeId = urlParts[urlParts.length - 1];
      franchise.stores = (franchise.stores || []).filter(s => s.id !== storeId);
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