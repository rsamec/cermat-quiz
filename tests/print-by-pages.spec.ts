import { test, expect } from '@playwright/test';
import { getTestUrl } from './test.utils';
import { quizes } from '../src/utils/quiz-utils.js'
import { parseCode } from "../src/utils/quiz-string-utils.js";

const viewportSize = { width: 1200, height: 900 };
const maxViewportSize = { width: 2800, height: 2100 };
const viewportSizeA4 = { height: 1123, width: 794 };


for (const {code, pagesCount, landscape} of quizes.flatMap(d => d.codes).flatMap(code => {
  return [2,3,4,5,6].map(pagesCount => ({code,pagesCount, landscape: true}))
  .concat([2,3,4,5,6].map(pagesCount => ({code,pagesCount, landscape: false})));
})) {
  test(`${code} - ${pagesCount} - ${landscape?'landscape':'portrait'}`, async ({ page }) => {
    await page.goto(getTestUrl(`print-${code}`));
    let pageScale = 1;
    let matchThePage = false;
    while (!matchThePage) {      
      const computedViewPortSize = landscape ? { width: Math.round(viewportSizeA4.height * pageScale), height: Math.round(viewportSizeA4.width * pageScale) } :{ width: Math.round(viewportSizeA4.width * pageScale), height: Math.round(viewportSizeA4.height * pageScale) }
      await page.setViewportSize(computedViewPortSize);
      await page.emulateMedia({ media: 'print' });
      await expect(page.getByTestId('root')).toBeVisible();

      const heightMatch = await page.evaluate(() => document.documentElement.scrollHeight / window.innerHeight);
      //console.log(computedViewPortSize, heightMatch)
      matchThePage = heightMatch <= pagesCount
      pageScale += 0.1;

    }
    const fileNameWithoutExtension = `${pagesCount}-${landscape ? 'lanscape': 'portrait'}`
    const {subject, period, year} = parseCode(code);
    console.log((1/pageScale).toLocaleString('cs',{maximumFractionDigits: 2 }), code)
    await page.pdf({    
      scale: 1 / pageScale,
      format: 'A4',
      landscape,
      margin: {
        top:20,
        left:20,
        bottom:20,
        right:20,
      },
      path: ['generated',`${subject}-${period}`, fileNameWithoutExtension].concat(`${code}.pdf`).join("/")
    })   
  });
}

