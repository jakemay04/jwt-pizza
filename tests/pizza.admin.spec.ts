import { test, expect } from '@playwright/test';
import { adminInit } from './backendAdmin';

test('admin dashboard renders correctly', async ({ page }) => {
  // Use the separate mock file
  await adminInit(page);
  
  // Navigate to login and authenticate
  await page.goto('/login');
  await page.getByPlaceholder('Email address').fill('admin@jwt.com');
  await page.getByPlaceholder('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();

  // Go to the dashboard
  await page.goto('/admin-dashboard');

  // Assertions based on the AdminDashboard structure
  await expect(page.getByText("Mama Ricci's kitchen")).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Ricci Originals' })).toBeVisible();
  
  // Verify Store and Revenue display
  await expect(page.getByText('Venice Store')).toBeVisible();
  await expect(page.getByText('1,500 ₿')).toBeVisible();
});

test('admin can navigate to create franchise page', async ({ page }) => {
    await adminInit(page);
    await page.goto('/login');
    await page.getByPlaceholder('Email address').fill('admin@jwt.com');
    await page.getByPlaceholder('Password').fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.goto('/admin-dashboard');
    await page.getByRole('button', { name: 'Add Franchise' }).click();
    await page.getByRole('textbox', { name: 'franchise name' }).click();
    await page.getByRole('textbox', { name: 'franchise name' }).fill('test');
    await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
    await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('test@test.com');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByText('test')).toBeVisible();
});