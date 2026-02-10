import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { Role, User } from '../src/service/pizzaService';

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = { 'f@jwt.com': { id: '3', name: 'Orem', email: 'f@jwt.com', password: 'f', roles: [{ role: Role.Franchisee }] } };
  
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

