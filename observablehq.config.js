import { formatSubject,formatPeriod, formatPdfFileName } from './src/utils/quiz-string-utils.js';
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


const unique =(value, index, array) =>  array.indexOf(value) === index;
const range = (start, end) => Array.from(
  Array(Math.abs(end - start) + 1), 
  (_, i) => start + i
);
const assetsFiles = getFilesRecursive(`./src/assets/math`).map(d => d.replace("src",""))

console.log("--------------------------------")
console.log(assetsFiles);
// See https://observablehq.com/framework/config for documentation.
export default {
  // The app’s title; used in the sidebar and webpage titles.
  title: "Banka úloh",
  header: ({title,data, path}) => title,
  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  pages: [
    {
      open: true,
      name: "Úlohy",
      pages: quizes.map(d => ({
        name: `${formatSubject(d.subject)} ${formatPeriod(d.period)}`,
        path: `/quiz-builder-${d.subject}-${d.period}`,
      }))
    },
    {
      open: false,
      name: "Testy",
      pages: quizes.map(d => ({
        name: `${formatSubject(d.subject)} ${formatPeriod(d.period)}`,
        path: `/quiz-picker-${d.subject}-${d.period}`,
      }))
    },
    {
      open: false,
      name: "Návody",
      pages:[
        {name: "Tisk", path: "/print"},
        {name: "Sestavení úloh", path: "/builder"},
        {name: "Přepoužitelnost", path: "/embedding"},
        {name: "AI", path: "/ai"},
        {name: "Data", path: "/inputs"},
        {name: "Řešení mat. výrazů", path: "/math"},
        {name: "Kategorie", path: "/categories"},
        // {name: "Inline md", path: "/quiz-markdown"},
      ]
    },
  ],
  globalStylesheets:['/assets/css/common/stacks.css'],
  // Content to add to the head of the page, e.g. for a favicon:
  head: `<link rel="icon" href="observable.png" type="image/png" sizes="32x32">
         <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
         <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tippy.js/6.3.7/tippy.min.css">
         <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css">
         `,

  // The path to the source root.
  root: "src",  
  dynamicPaths:[]
  .concat(assetsFiles)
  .concat(['/components/quiz.js'])
  .concat(quizes.flatMap(d => d.codes).map(code => `/form-${code}`))
  .concat(quizes.flatMap(d => d.codes).map(code => `/print-${code}`))
  .concat(quizes.flatMap(d => d.codes).map(code => `/impress-${code}`))
  .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/math-${code}`))
  .concat(quizes.map(d => `/quiz-${d.subject}-${d.period}`))
  .concat(quizes.map(d => `/quiz-picker-${d.subject}-${d.period}`))
  .concat(quizes.map(d => `/quiz-builder-${d.subject}-${d.period}`))
  .concat(quizes.flatMap(d => printedPages.map(p => `/assets/pdf/${d.subject}-${d.period}/${formatPdfFileName(p)}.pdf`)))  

};
