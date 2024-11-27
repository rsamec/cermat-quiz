import { test, expect } from '@playwright/test';
import { getTestUrl } from './test.utils';
import { quizes } from "../src/utils/quiz-utils.js";

const codes = quizes.flatMap(d => d.codes);


for (const code of codes) {
  test(`${code}`, async ({ page }) => {
    await page.goto(getTestUrl(`print-${code}`));
    //await page.emulateMedia({ media: 'print' });
    await expect(page.getByTestId('root')).toBeVisible();

    
    const snapshot = await page.locator('body').ariaSnapshot();
    console.log(snapshot);
  })
}

