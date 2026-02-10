import { Page, expect } from '@playwright/test';
import { Role, User, FranchiseList } from '../src/service/pizzaService';

export async function adminInit(page: Page) {
  // 1. Define the Admin User State
  const adminUser: User = {
    id: '1',
    name: 'Mama Ricci',
    email: 'admin@jwt.com',
    password: 'admin',
    roles: [{ role: Role.Admin }],
  };

  // 2. Mock Auth & User State
  await page.route('*/**/api/auth', async (route) => {
    if (route.request().method() === 'PUT') {
      await route.fulfill({ json: { user: adminUser, token: 'admin-token-123' } });
    } else {
      await route.continue();
    }
  });

  await page.route('*/**/api/user/me', async (route) => {
    await route.fulfill({ json: adminUser });
  });

  // 3. Mock Franchise Endpoints (List & Creation)
  await page.route(/\/api\/franchise/, async (route) => {
    // Handle POST (Franchise Creation)
    if (route.request().method() === 'POST') {
      // Check authorization
      const authHeader = route.request().headerValue('Authorization');
      if (!authHeader || authHeader !== 'Bearer admin-token-123') {
        await route.fulfill({ status: 401, json: { code: 401, message: 'unauthorized' } });
        return;
      }
      const requestData = route.request().postDataJSON();
      await route.fulfill({ json: { ...requestData, id: '999', stores: [] } });
    }
    // Handle GET (Franchise List)
    else {
      const url = new URL(route.request().url());
      const filter = url.searchParams.get('filter') || url.searchParams.get('name') || '*';
      
      const mockData: FranchiseList = {
        franchises: [
          {
            id: '1',
            name: 'Ricci Originals',
            admins: [{ id: '10', name: 'Mario', email: 'm@pizza.com' }],
            stores: [
              { id: '101', name: 'Venice Store', totalRevenue: 1500 },
              { id: '102', name: 'Rome Store', totalRevenue: 2800 }
            ],
          },
          {
            id: '2',
            name: 'Mama Pizza',
            admins: [{ id: '11', name: 'Luigi', email: 'l@pizza.com' }],
            stores: [],
          }
        ],
        more: false
      };

      // Filter logic to match the filterFranchises function in the component
      if (filter !== '*') {
        const query = filter.replace(/\*/g, '').toLowerCase();
        mockData.franchises = mockData.franchises.filter(f => 
          f.name.toLowerCase().includes(query)
        );
      }

      await route.fulfill({ json: mockData });
    }
  });

  // 4. Mock Order Menu (to prevent errors during navigation)
  await page.route('*/**/api/order/menu', async (route) => {
    await route.fulfill({ json: [] });
  });
}  