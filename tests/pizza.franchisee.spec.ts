import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { Role, User } from '../src/service/pizzaService';
import { basicInit } from './backendUser';
import { franchiseInit } from './backendFranchisee';

test('login as franchisee', async ({ page }) => {
  await franchiseInit(page);
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('f');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('link', { name: /^O$/ })).toBeVisible();
});

test('franchisee can view franchise dashboard', async ({ page }) => {
  await franchiseInit(page);
  
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
  await franchiseInit(page);
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
  await franchiseInit(page);
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

test('store revenue updates after order', async ({ page }) => {
  await franchiseInit(page);
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com')
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();


  

});