import { Page, expect } from '@playwright/test';
import { Role, User, FranchiseList, Franchise } from '../src/service/pizzaService';

export async function adminInit(page: Page) {
  // 1. Define the Admin User State
  const adminUser: User = {
    id: '1',
    name: 'Mama Ricci',
    email: 'admin@jwt.com',
    password: 'admin',
    roles: [{ role: Role.Admin }],
  };

  // Track created franchises so GET requests include them
  const createdFranchises: Franchise[] = [];

  // Set up all mocks BEFORE navigating to the page
  
  // 2. Mock Auth & User State
  await page.route('*/**/api/auth', async (route) => {
    console.log('Mock /api/auth intercepted:', route.request().method());
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
    console.log('Mock /api/franchise intercepted:', route.request().method(), route.request().url());
    // Handle POST (Franchise Creation)
    if (route.request().method() === 'POST') {
      // Check authorization
      const authHeader = await route.request().headerValue('Authorization');
      console.log('Authorization header:', authHeader);
      if (!authHeader || authHeader !== 'Bearer admin-token-123') {
        console.log('Authorization failed - rejecting with 401');
        await route.fulfill({ status: 401, json: { code: 401, message: 'unauthorized' } });
        return;
      }
      console.log('Authorization successful - creating franchise');
      const requestData = route.request().postDataJSON();
      const newFranchise: Franchise = { ...requestData, id: String(createdFranchises.length + 999), stores: [] };
      createdFranchises.push(newFranchise);
      console.log('Added franchise to tracking:', newFranchise);
      await route.fulfill({ json: newFranchise });
    }
    // Handle GET (Franchise List)
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

      // Add any created franchises
      allFranchises.push(...createdFranchises);

      const mockData: FranchiseList = {
        franchises: allFranchises,
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

  // 5. Mock Close Franchise Endpoint
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

  // 6. Mock Close Store Endpoint
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