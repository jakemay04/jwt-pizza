import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { Role, User } from '../src/service/pizzaService';

export async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = { 'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] } };

    // backendUser.ts - combined auth handler
await page.route('*/**/api/auth', async (route) => {
  const method = route.request().method();
  const data = route.request().postDataJSON();

  if (method === 'POST') {
    // REGISTER
    const newUser: User = {
      id: String(Object.keys(validUsers).length + 1),
      name: data.name,
      email: data.email,
      password: data.password,
      roles: [{ role: Role.Diner }],
    };
    validUsers[data.email] = newUser;
    loggedInUser = newUser; // Sets state for /api/user/me
    await route.fulfill({ status: 201, json: { user: newUser, token: 'abcdef' } });

  } else if (method === 'PUT') {
    // LOGIN
    const user = validUsers[data.email];
    if (!user || user.password !== data.password) {
      await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
      return;
    }
    loggedInUser = user;
    await route.fulfill({ json: { user: loggedInUser, token: 'abcdef' } });

  } else if (method === 'DELETE') {
    // LOGOUT
    loggedInUser = undefined;
    await route.fulfill({ status: 200 });
  }
});

  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  // A standard menu
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      {
        id: 1,
        title: 'Veggie',
        image: 'pizza1.png',
        price: 0.0038,
        description: 'A garden of delight',
      },
      {
        id: 2,
        title: 'Pepperoni',
        image: 'pizza2.png',
        price: 0.0042,
        description: 'Spicy treat',
      },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  // Standard franchises and stores
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    const franchiseRes = {
      franchises: [
        {
          id: 2,
          name: 'LotaPizza',
          stores: [
            { id: 4, name: 'Lehi' },
            { id: 5, name: 'Springville' },
            { id: 6, name: 'American Fork' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        { id: 4, name: 'topSpot', stores: [] },
      ],
    };
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  // Order a pizza.
  await page.route('*/**/api/order', async (route) => {
    if (route.request().method() === 'POST') {
    const orderReq = route.request().postDataJSON();
    const orderRes = {
      order: { ...orderReq, id: 23 },
      jwt: 'eyJpYXQ',
    };
    await route.fulfill({ json: orderRes });
  } else {
    // If it's a GET (like fetching order history), provide a default empty list or continue
    await route.fulfill({ json: { orders: [], count: 0 } });
  }

});

  await page.goto('/');
}