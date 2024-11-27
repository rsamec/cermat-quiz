import { chromium } from 'playwright';  // Or 'firefox' or 'webkit'.

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  //const browser = await chromium.launchPersistentContext("test-res", { slowMo: 1000, hasTouch: true, headless: true,  recordVideo:{dir: 'video'} });

  const page = await browser.newPage();
  await page.goto('https://www.cermatdata.cz/print-M9A-2024');
  

  await page.evaluate(() => window.scrollBy(0, 10));
  await page.waitForTimeout(10);
  await page.evaluate(() => window.scrollBy(0, 10));
  await page.waitForTimeout(10);
  await page.evaluate(() => window.scrollBy(0, 10));
  await page.waitForTimeout(10);
  await page.evaluate(() => window.scrollBy(0, 10));
  await page.waitForTimeout(10);
  await page.evaluate(() => window.scrollBy(0, 10));
  await page.waitForTimeout(10);
  await page.evaluate(() => window.scrollBy(0, 10));
  await page.waitForTimeout(10);
  await page.evaluate(() => window.scrollBy(0, 10));
  await page.waitForTimeout(10);
  await page.evaluate(() => window.scrollBy(0, 10));
  await page.waitForTimeout(10);
  await page.evaluate(() => window.scrollBy(0, 10));
  await page.waitForTimeout(10);

  // other actions...
  await browser.close();
})();