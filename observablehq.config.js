import { formatSubject, formatPeriod, formatPdfFileName } from './src/utils/quiz-string-utils.js';
import { quizes, printedPages } from './src/utils/quiz-utils.js';

import { readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Recursively retrieves all files in a directory.
 * @param {string} dir - The directory path to search.
 * @returns {string[]} - Array of file paths.
 */
function getFilesRecursive(dir) {
  let results = [];

  try {
    const list = readdirSync(dir); // Read contents of the directory
    list.forEach(file => {
      const filePath = join(dir, file);
      const stat = statSync(filePath); // Get file stats

      if (stat && stat.isDirectory()) {
        // If directory, recursively retrieve files
        results = results.concat(getFilesRecursive(filePath));
      } else {
        // If file, add to results
        results.push(filePath);
      }
    });
  } catch (err) {
    console.error(`Error reading directory: ${err.message}`);
  }

  return results;
}


const unique = (value, index, array) => array.indexOf(value) === index;
const range = (start, end) => Array.from(
  Array(Math.abs(end - start) + 1),
  (_, i) => start + i
);
const assetsFiles = getFilesRecursive(`./src/assets/math`).map(d => d.replace("src", ""))

// See https://observablehq.com/framework/config for documentation.
export default {
  // The app’s title; used in the sidebar and webpage titles.
  title: "Banka úloh",
  header: ({ title, data, path }) => title,
  footer: ({ title, data, path }) => `<div class="h-stack"><div class="h-stack h-stack--s"  style="flex:1"><span>2025</span><i class="fa-solid fa-copyright"></i><span>Roman Samec</span></div><a class="h-stack h-stack--s" href="https://github.com/rsamec/cermat-quiz"><i class="fa-brands fa-github"></i><span>Zdrojový kód</span></a>`,

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  pages: [
    {
      open: true,
      name: "Testy",
      pages: quizes.map(d => ({
        name: `${formatSubject(d.subject)} ${formatPeriod(d.period)}`,
        path: `/quiz-picker-${d.subject}-${d.period}`,
      }))
    },
    {
      open: false,
      name: "Úlohy",
      pages: quizes.map(d => ({
        name: `${formatSubject(d.subject)} ${formatPeriod(d.period)}`,
        path: `/quiz-sel-${d.subject}-${d.period}`,
      }))
    },
    {
      open: false,
      name: "Návody",
      pages: [
        { name: "Data", path: "/inputs" },
        { name: "Tisk", path: "/print" },
        { name: "Sestavení úloh", path: "/builder" },
        { name: "Přepoužitelnost", path: "/embedding" },
        { name: "AI", path: "/ai" },
        // {name: "Kategorie", path: "/categories"},
        // {name: "Inline md", path: "/quiz-markdown"},
        // {name: "Rozvržení stránky", path: "/layout"},
      ]
    },
    {
      open: false,
      name: "Matematizace",
      pages: [
        { name: "Slovní úlohy", path: "/math-deduction" },
        { name: "Slovní úlohy - příklady", path: "/math-deduction-examples" },
        { name: "Výrazy, rovnice", path: "/math" },
        { name: "Konstrukční úlohy", path: "/math-geometry" },
      ]
    },
  ],
  globalStylesheets: ['/assets/css/common/stacks.css'],
  // Content to add to the head of the page, e.g. for a favicon:
  head: `<link rel="icon" href="favicon.ico" type="image/png" sizes="32x32">
         <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css">
         <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tippy.js/6.3.7/tippy.min.css">
         <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css">
         <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css"/>
         `,

  // The path to the source root.
  root: "src",
  dynamicPaths: []
    .concat(assetsFiles.concat("/assets/css/print-results.css"))
    .concat(['/components/quiz-html.js'])
    .concat(['/components/quiz.js'])
    .concat(['/components/quiz-store.js'])
    .concat(['/components/math.js'])
    .concat(quizes.flatMap(d => d.codes).map(code => `/form-${code}`))
    .concat(quizes.flatMap(d => d.codes).map(code => `/print-${code}`))
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/ai-${code}`))
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/math-${code}`))
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/solu-${code}`))
    // .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/solution-${code}`))
    // .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/word-problems-solu-${code}`))
    .concat(quizes.map(d => `/quiz-${d.subject}-${d.period}`))
    .concat(quizes.map(d => `/quiz-print-${d.subject}-${d.period}`))
    .concat(quizes.map(d => `/quiz-picker-${d.subject}-${d.period}`))
    .concat(quizes.map(d => `/quiz-sel-${d.subject}-${d.period}`))
    .concat(quizes.map(d => `/quiz-builder-${d.subject}-${d.period}`))
    .concat(quizes.flatMap(d => printedPages.map(p => `/assets/pdf/${d.subject}-${d.period}/${formatPdfFileName(p)}.pdf`)))

};
