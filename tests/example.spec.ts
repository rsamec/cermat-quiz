import { test, expect } from '@playwright/test';
import { getTestUrl } from './test.utils';
import { quizes } from '../src/utils/quizes.js'
import categories from '../src/utils/quiz-categories'

const viewportSize = { width: 1200, height: 900 };
const maxViewportSize = { width: 2800, height: 2100 };
const viewportSizeA4 = { height: 1123, width: 794 };



for (const code of quizes.flatMap(d => d.codes)) {
  test(`screenshot root document ${code}`, async ({ page }) => {
    await page.goto(getTestUrl(`form-${code}`));

    await page.setViewportSize(viewportSize);
    await page.emulateMedia({ media: 'print' });
    await expect(page.getByTestId('root')).toBeVisible();

    await page.screenshot({ fullPage: true, path: ['assets'].concat(`${code}.png`).join("/") })
  });
}
const items = [{code:'matika', q:""}]

for (const {code,q} of items) {
  test(`items - pdf ${code}`, async ({ page }) => {
    await page.goto(getTestUrl(q));

    await page.setViewportSize(viewportSize);
    await page.emulateMedia({ media: 'print' });
    await expect(page.getByTestId('root')).toBeVisible({timeout:10000});
    const margin = 10;
    await page.pdf({
      scale: 0.46,
      format: 'A4',
      landscape: true,
      margin: {
        top:margin,
        left:margin,
        right: margin,
        bottom: margin
      },
      path: ['assets'].concat(`${code}.pdf`).join("/")
    })    
  });
}

for (const {code, pagesCount, landscape} of quizes.flatMap(d => d.codes).flatMap(code => {
  return [5,6].map(pagesCount => ({code,pagesCount, landscape: true}))
  .concat([5,6,7].map(pagesCount => ({code,pagesCount, landscape: false})));
})) {
  test(`generate pdf document ${code} - ${pagesCount} - ${landscape?'landscape':'portrait'}`, async ({ page }) => {
    await page.goto(getTestUrl(`form-${code}`));
    let pageScale = 1;
    let matchThePage = false;
    while (!matchThePage) {      
      const computedViewPortSize = landscape ? { width: Math.round(viewportSizeA4.height * pageScale), height: Math.round(viewportSizeA4.width * pageScale) } :{ width: Math.round(viewportSizeA4.width * pageScale), height: Math.round(viewportSizeA4.height * pageScale) }
      await page.setViewportSize(computedViewPortSize);
      await page.emulateMedia({ media: 'print' });
      await expect(page.getByTestId('root')).toBeVisible();

      const heightMatch = await page.evaluate(() => document.documentElement.scrollHeight / window.innerHeight);
      console.log(computedViewPortSize, heightMatch)
      matchThePage = heightMatch <= pagesCount

      pageScale += 0.1;

    }

    await page.pdf({
      scale: 1 / pageScale,
      format: 'A4',
      landscape,
      path: ['assets'].concat(`${code}-${pagesCount}-${landscape ? 'lanscape': 'portrait'}.pdf`).join("/")
    })
  });
}

