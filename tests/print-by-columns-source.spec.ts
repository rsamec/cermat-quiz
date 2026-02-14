import { test, expect } from '@playwright/test';
import { getTestUrl } from './test.utils';
import { calculatePageScale, type PageSize, type PageOrientation } from './print.utils';
import { parseCode, formatPdfFileName } from '../src/utils/quiz-string-utils.js'
import { printedPages } from "../src/utils/quiz-utils.js";
import { resolve } from 'node:path';
import { readdirSync } from 'node:fs';

const margin = 16;
const columnWidth = 24 * 17;
for (const source of ["ctedu", "cermat"]) {
  const sourcePath = resolve(`./src/${source}`);

  const folders = readdirSync(sourcePath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const printRequestsMap = Object.groupBy<string, { period: string, pageSize: PageSize, columnsCount: number, orientation: PageOrientation }>(folders.flatMap(period => {
    return printedPages.map(d => ({ ...d, period }))
  }), ({ period }) => period)

  for (const code of folders) {
    test(`${source} - ${code}`, async ({ page }) => {
      await page.goto(getTestUrl(`${source}/print-${code}`));
      await page.emulateMedia({ media: 'print' });
      await expect(page.getByTestId('root')).toBeVisible();

      const subject = source == "cermat" ? parseCode(code).subject : source;
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
          path: ['generated', `${subject}`, `${formatPdfFileName({ pageSize, columnsCount, orientation })}`].concat(`${code}.pdf`).join("/")
        })
      }
    });
  }
}

