import { test, expect } from '@playwright/test';
import { getTestUrl } from './test.utils';
import { calculatePageScale, PageSize, PageOrientation } from './print.utils';
import { quizes } from '../src/utils/quizes.js'
import { parseCode } from "../src/utils/quiz-utils.js";

const margin = 16;
const columnWidth = 24 * 17;
const codes = quizes.flatMap(d => d.codes);
const printRequestsMap = Object.groupBy<string, { code: string, pageSize: PageSize, columnsCount: number, orientation: PageOrientation }>(codes.flatMap(code => {
  return [2, 3, 4].map(columnsCount => ({ code, pageSize: 'A4', columnsCount, orientation: 'landscape' }))
    .concat([1, 2, 3].map(columnsCount => ({ code, pageSize: 'A4', columnsCount, orientation: 'portrait' })))
    .concat([4, 5, 6, 7, 8].map(columnsCount => ({ code, pageSize: 'A3', columnsCount, orientation: 'landscape' })))
    .concat([3, 4, 5, 6].map(columnsCount => ({ code, pageSize: 'A3', columnsCount, orientation: 'portrait' })))
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
      console.log(`${columnsCount}-> ${pageScale}`);
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
        path: ['generated', `${subject}-${period}`, `${pageSize}-sloupce-${columnsCount}${orientation == 'landscape' ? '-na sirku':''}`].concat(`${code}.pdf`).join("/")
      })
    }
  });
}

