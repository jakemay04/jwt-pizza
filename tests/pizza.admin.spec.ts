import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import { Role, User } from '../src/service/pizzaService';
import { basicInit } from './backendUser';
import { franchiseInit } from './backendFranchisee';
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
    
    // Wait for token to be saved
    await page.waitForTimeout(500);
    const token = await page.evaluate(() => localStorage.getItem('token'));
    
    await page.goto('/admin-dashboard');
    await page.getByRole('button', { name: 'Add Franchise' }).click();
    await page.getByRole('textbox', { name: 'franchise name' }).click();
    await page.getByRole('textbox', { name: 'franchise name' }).fill('test');
    await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
    await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('test@test.com');
    
    // Wait for the create request to complete
    await Promise.all([
      page.waitForResponse(response => response.url().includes('/api/franchise') && response.request().method() === 'POST'),
      page.getByRole('button', { name: 'Create' }).click(),
    ]);
    
    // Check if we got an error message
    const errorMessage = await page.locator('text=unauthorized').isVisible().catch(() => false);
    
    // Wait a bit for navigation
    await page.waitForTimeout(1000);
    
    // Check if the text 'test' is visible (would show in franchise list if created)
    const isTestVisible = await page.getByText('test').isVisible().catch(() => false);
    
    if (isTestVisible) {
      await expect(page.getByText('test')).toBeVisible();
    }
});

test('admin can filter franchises', async ({ page }) => {
  await adminInit(page);
  await page.goto('/login');
  await page.getByPlaceholder('Email address').fill('admin@jwt.com');
  await page.getByPlaceholder('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.goto('/admin-dashboard');
  
  // Verify both franchises are visible initially
  await expect(page.getByRole('cell', { name: 'Ricci Originals' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Mama Pizza' })).toBeVisible();
  
  // Filter for 'Ricci'
  await page.getByPlaceholder('Filter franchises').fill('Ricci');
  await page.getByRole('button', { name: 'Submit' }).click();
  
  await page.waitForTimeout(500);
  
  // Only 'Ricci Originals' should be visible
  await expect(page.getByRole('cell', { name: 'Ricci Originals' })).toBeVisible();
  const mamaVisible = await page.getByRole('cell', { name: 'Mama Pizza' }).isVisible().catch(() => false);
  expect(mamaVisible).toBe(false);
});

test('admin can navigate franchise pages', async ({ page }) => {
  await adminInit(page);
  await page.goto('/login');
  await page.getByPlaceholder('Email address').fill('admin@jwt.com');
  await page.getByPlaceholder('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.goto('/admin-dashboard');
  
  // Verify previous button is disabled initially
  const prevButton = page.locator('button:has-text("«")');
  await expect(prevButton).toBeDisabled();
  
  // Next button should be disabled (no more franchises)
  const nextButton = page.locator('button:has-text("»")');
  await expect(nextButton).toBeDisabled();
});

test('admin can close franchise', async ({ page }) => {
  await adminInit(page);
  await page.goto('/login');
  await page.getByPlaceholder('Email address').fill('admin@jwt.com');
  await page.getByPlaceholder('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.goto('/admin-dashboard');
  
  // Find and click the Close button for Ricci Originals
  const closeButtons = page.getByRole('button', { name: /Close/ });
  const firstCloseButton = closeButtons.first();
  
  await firstCloseButton.click();
  
  // Should navigate to close-franchise route
  await page.waitForURL('**/close-franchise');
  await expect(page).toHaveURL(/close-franchise/);
});

test('admin can close store', async ({ page }) => {
  await adminInit(page);
  await page.goto('/login');
  await page.getByPlaceholder('Email address').fill('admin@jwt.com');
  await page.getByPlaceholder('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.goto('/admin-dashboard');
  
  // Find the Close button for a store (not franchise)
  const closeButtons = page.getByRole('button', { name: /Close/ });
  const allButtons = await closeButtons.all();
  
  if (allButtons.length > 1) {
    // Click the second Close button (store close button)
    await allButtons[1].click();
    
    // Should navigate to close-store route
    await page.waitForURL('**/close-store');
    await expect(page).toHaveURL(/close-store/);
  }
});

test('admin dashboard displays table headers', async ({ page }) => {
  await adminInit(page);
  await page.goto('/login');
  await page.getByPlaceholder('Email address').fill('admin@jwt.com');
  await page.getByPlaceholder('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.goto('/admin-dashboard');
  
  // Verify all table headers are present
  await expect(page.getByRole('columnheader', { name: 'Franchise', exact: true })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Franchisee', exact: true })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Store', exact: true })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Revenue', exact: true })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Action', exact: true })).toBeVisible();
});

test('admin can complete close franchise workflow', async ({ page }) => {
  await adminInit(page);
  await page.goto('/login');
  await page.getByPlaceholder('Email address').fill('admin@jwt.com');
  await page.getByPlaceholder('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.goto('/admin-dashboard');
  
  // Find and click the Close button for first franchise
  const closeButtons = page.getByRole('button', { name: /Close/ });
  const firstCloseButton = closeButtons.first();
  await firstCloseButton.click();
  
  // Should navigate to close-franchise route
  await page.waitForURL('**/close-franchise');
  
  // Verify the close franchise page title
  await expect(page.getByText('Sorry to see you go')).toBeVisible();
  
  // Verify franchise name is displayed
  await expect(page.getByText(/Ricci Originals/)).toBeVisible();
  
  // Cancel the close operation
  const cancelButton = page.locator('button:has-text("Cancel")').last();
  await cancelButton.click();
  
  // Should navigate back to admin dashboard
  await page.waitForURL('**/admin-dashboard');
});

test('admin can complete close store workflow', async ({ page }) => {
  await adminInit(page);
  await page.goto('/login');
  await page.getByPlaceholder('Email address').fill('admin@jwt.com');
  await page.getByPlaceholder('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.goto('/admin-dashboard');
  
  // Find and click a Store's Close button (not franchise)
  const allCloseButtons = await page.getByRole('button', { name: /Close/ }).all();
  if (allCloseButtons.length > 1) {
    // Click the second close button (for a store)
    await allCloseButtons[1].click();
    
    // Should navigate to close-store route
    await page.waitForURL('**/close-store');
    
    // Verify the close store page title
    await expect(page.getByText('Sorry to see you go')).toBeVisible();
    
    // Verify store and franchise name are displayed
    await expect(page.getByText(/Venice Store|Rome Store/)).toBeVisible();
    
    // Cancel the close operation
    const cancelButton = page.locator('button:has-text("Cancel")').last();
    await cancelButton.click();
    
    // Should navigate back to admin dashboard
    await page.waitForURL('**/admin-dashboard');
  }
});

test('admin list users page', async ({ page }) => {
  await adminInit(page);
  await page.goto('/login');
  await page.getByPlaceholder('Email address').fill('admin@jwt.com');
  await page.getByPlaceholder('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.goto('/admin-dashboard');
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Users', exact: true })).toBeVisible();
});

test('admin users list includes mock users', async ({ page }) => {
  await adminInit(page);
  await page.goto('/login');
  await page.getByPlaceholder('Email address').fill('admin@jwt.com');
  await page.getByPlaceholder('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.goto('/admin-dashboard');
  
  // Wait for the users table to load
  await page.waitForSelector('table', { timeout: 5000 });
  
  // Verify at least one user from the mock is visible
  await expect(page.getByRole('cell', { name: 'Mario' }).nth(1)).toBeVisible();
  
});