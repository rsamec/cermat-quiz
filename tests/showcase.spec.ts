import { test, expect } from '@playwright/test';
import { getTestUrl } from './test.utils';

  test(`show case`, async ({ page }) => {
    const code = 'M9C-2024'
    await page.goto(getTestUrl(`math-${code}`));
    await expect(page.getByTestId('root')).toBeVisible();
    

  });

