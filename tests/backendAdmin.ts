import { Page, expect } from '@playwright/test';
import { Role, User, FranchiseList, Franchise } from '../src/service/pizzaService';

export async function adminInit(page: Page) {
  //initialize admin
  const adminUser: User = {
    id: '1',
    name: 'Mama Ricci',
    email: 'admin@jwt.com',
    password: 'admin',
    roles: [{ role: Role.Admin }],
  };

  const createdFranchises: Franchise[] = [];

  
  //Mock Auth & User State
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

  await page.route(/\/api\/user(\?.*)?$/, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.fulfill({ status: 405, json: { message: 'Method not allowed' } });
      return;
    }

    await route.fulfill({
      json: {
        users: [
          { id: '10', name: 'Mario', email: 'm@pizza.com' },
          { id: '11', name: 'Luigi', email: 'l@pizza.com' },
        ],
        more: false,
      },
    });
  });

  //Mock Franchise Endpoints (List & Creation)
  await page.route(/\/api\/franchise/, async (route) => {
    // handle franchise creation
    if (route.request().method() === 'POST') {
      // Check authorization
      const authHeader = await route.request().headerValue('Authorization');
      if (!authHeader || authHeader !== 'Bearer admin-token-123') {
        await route.fulfill({ status: 401, json: { code: 401, message: 'unauthorized' } });
        return;
      }
      const requestData = route.request().postDataJSON();
      const newFranchise: Franchise = { ...requestData, id: String(createdFranchises.length + 999), stores: [] };
      createdFranchises.push(newFranchise);
      await route.fulfill({ json: newFranchise });
    }
    // handle franchise list
    else {
      const url = new URL(route.request().url());
      const filter = url.searchParams.get('filter') || url.searchParams.get('name') || '*';
      
      // Start with default franchises
      const allFranchises: Franchise[] = [
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
      ];

      allFranchises.push(...createdFranchises);

      const mockData: FranchiseList = {
        franchises: allFranchises,
        more: false
      };

      if (filter !== '*') {
        const query = filter.replace(/\*/g, '').toLowerCase();
        mockData.franchises = mockData.franchises.filter(f => 
          f.name.toLowerCase().includes(query)
        );
      }

      await route.fulfill({ json: mockData });
    }
  });

  // Mock order menu endpoint
  await page.route('*/**/api/order/menu', async (route) => {
    await route.fulfill({ json: [] });
  });

  // Mock close franchise endpoint
  await page.route(/\/api\/franchise\/\d+/, async (route) => {
    if (route.request().method() === 'DELETE') {
      const authHeader = await route.request().headerValue('Authorization');
      if (!authHeader || authHeader !== 'Bearer admin-token-123') {
        await route.fulfill({ status: 401, json: { code: 401, message: 'unauthorized' } });
        return;
      }
      await route.fulfill({ json: { message: 'franchise deleted' } });
    } else {
      await route.continue();
    }
  });

  // Mock close store endpoint
  await page.route(/\/api\/franchise\/\d+\/store\/\d+/, async (route) => {
    if (route.request().method() === 'DELETE') {
      const authHeader = await route.request().headerValue('Authorization');
      if (!authHeader || authHeader !== 'Bearer admin-token-123') {
        await route.fulfill({ status: 401, json: { code: 401, message: 'unauthorized' } });
        return;
      }
      await route.fulfill({ json: { message: 'store deleted' } });
    } else {
      await route.continue();
    }
  });
}  