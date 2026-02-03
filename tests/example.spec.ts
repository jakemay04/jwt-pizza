import { test, expect } from 'playwright-test-coverage';

test('register', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByRole('textbox', { name: 'Full name' }).fill('bob');
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('bob@pizza.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('pizza');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page.getByRole('link', { name: 'b', exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'b', exact: true }).click();
    await expect(page.getByText('bob@pizza.com')).toBeVisible();

});

test('login test', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('bob@pizza.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('pizza');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('link', { name: 'b', exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'b', exact: true }).click();
    await expect(page.getByText('bob@pizza.com')).toBeVisible();

});