import fs from 'fs';
import path from 'path';
import { test as base } from '@playwright/test';

// Custom test fixture to collect coverage after each test
export const test = base.extend({
  page: async ({ page }, use) => {
    await use(page);
    // Collect coverage after each test
    const coverage = await page.evaluate(() => window.__coverage__);
    if (coverage) {
      const outputDir = path.resolve(process.cwd(), '.nyc_output');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }
      const file = path.join(outputDir, `out-${Math.random().toString(36).substring(2, 15)}.json`);
      fs.writeFileSync(file, JSON.stringify(coverage));
    }
  },
});
