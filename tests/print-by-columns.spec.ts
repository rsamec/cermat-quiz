import { test, expect } from '@playwright/test';
import { getTestUrl } from './test.utils';
import { calculatePageScale, PageSize, PageOrientation } from './print.utils';
import { parseCode, formatPdfFileName } from '../src/utils/quiz-string-utils.js'
import { quizes, printedPages } from "../src/utils/quiz-utils.js";

const margin = 16;
const columnWidth = 24 * 17;
const codes = quizes.flatMap(d => d.codes);
const printRequestsMap = Object.groupBy<string, { code: string, pageSize: PageSize, columnsCount: number, orientation: PageOrientation }>(codes.flatMap(code => {
  return printedPages.map(d => ({...d,code}))
}), ({ code }) => code)

for (const code of codes) {
  test(`${code}`, async ({ page }) => {
    await page.goto(getTestUrl(`print-${code}`));
    await page.emulateMedia({ media: 'print' });
    await expect(page.getByTestId('root')).toBeVisible();

    const { subject, period, year } = parseCode(code);

    const printRequests = printRequestsMap[code];
    for (const { pageSize, columnsCount, orientation } of printRequests) {
      let pageScale = calculatePageScale(pageSize, orientation, columnWidth, columnsCount, margin);
      console.log(`${pageSize} ${orientation}, ${columnsCount}-> ${pageScale}`);
      await page.pdf({
        scale: pageScale > 1 ? 1 : pageScale,
        format: pageSize,
        landscape: orientation === "landscape",
        margin: {
          top: margin,
          left: margin,
          bottom: margin,
          right: margin,
        },
        path: ['generated', `${subject}-${period}`, `${formatPdfFileName({pageSize,columnsCount,orientation})}`].concat(`${code}.pdf`).join("/")
      })
    }
  });
}

