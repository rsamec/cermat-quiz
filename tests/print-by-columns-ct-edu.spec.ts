import { test, expect } from '@playwright/test';
import { getTestUrl } from './test.utils';
import { calculatePageScale, type PageSize, type PageOrientation } from './print.utils';
import { parseCode, formatPdfFileName } from '../src/utils/quiz-string-utils.js'
import { quizes, printedPages } from "../src/utils/quiz-utils.js";
import { resolve } from 'node:path';
import { readdirSync } from 'node:fs';

const ctEduPath = resolve(`./src/ctedu`);

const ctEduFolders = readdirSync(ctEduPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

const subject = "ctedu";
  
const margin = 16;
const columnWidth = 24 * 17;
const printRequestsMap = Object.groupBy<string, { period: string, pageSize: PageSize, columnsCount: number, orientation: PageOrientation }>(ctEduFolders.flatMap(period => {
  return printedPages.map(d => ({...d,period}))
}), ({ period }) => period)

for (const period of ctEduFolders) {
  test(`${period}`, async ({ page }) => {
    await page.goto(getTestUrl(`ctedu/print-${period}`));
    await page.emulateMedia({ media: 'print' });
    await expect(page.getByTestId('root')).toBeVisible();

    const printRequests = printRequestsMap[period];
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
        path: ['generated', `${subject}`, `${formatPdfFileName({pageSize,columnsCount,orientation})}`].concat(`${period}.pdf`).join("/")
      })
    }
  });
}

