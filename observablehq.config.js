import { formatSubject, formatPeriod, formatPdfFileName } from './src/utils/quiz-string-utils.js';
import { quizes, printedPages } from './src/utils/quiz-utils.js';
import wordProblems from './src/math/word-problems.js';
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
const wordProblemsKeyValuePairs = Object.entries(wordProblems).flatMap(([key,value]) => Object.keys(value).map(d => d.split('.')[0]).filter(unique).map(d => [key,d]));


// See https://observablehq.com/framework/config for documentation.
export default {
  // The app’s title; used in the sidebar and webpage titles.
  title: "Banka úloh",
  header: ({ title, data, path }) => title,
  footer: ({ title, data, path }) => `<div class="h-stack"><div class="h-stack h-stack--s"  style="flex:1"><span>2025</span><i class="fa-solid fa-copyright"></i><a href="mailto:roman.samec2@gmail.com">Roman Samec</a></div></a></div>`,

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
      name: "Sestavení testu z úloh",
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
        // { name: "Sestavení úloh", path: "/builder" },
        // { name: "Přepoužitelnost", path: "/embedding" },
        { name: "AI", path: "/ai" },
        // { name: "Novinky", path: "/news" },
        // {name: "Kategorie", path: "/categories"},
        // {name: "Inline md", path: "/quiz-markdown"},
        // {name: "Rozvržení stránky", path: "/layout"},
      ]
    },
    {
      open: false,
      name: "Matematika",
      pages: [        
        { name: "Slovní úlohy", path: "/word-problems-summary" },
        { name: "Slovní úlohy - matematizace", path: "/math-deduction" },
        { name: "Výrazy, konstrukční úlohy", path: "/math" },
        // { name: "Prostředí", path:"math-environments"},
      ]
    },
    { name: "Podmínky používání", path: "/app-usage" },
  ],
  globalStylesheets: ['/assets/css/common/stacks.css'],
  // Content to add to the head of the page, e.g. for a favicon:
  head: `<link rel="icon" href="favicon.ico" type="image/png" sizes="32x32">
         <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css">
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
    .concat(['gpt-4o','o3-mini', 'gpt-5-mini'].map(model => `/ai-results-${model}`))
    .concat('/blog/20250330')
    .concat(quizes.flatMap(d => d.codes).map(code => `/form-${code}`))
    .concat(quizes.flatMap(d => d.codes).map(code => `/print-${code}`))
    .concat(quizes.flatMap(d => d.codes).map(code => `/arch-${code}`))
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/ai-gpt-5-mini-as-${code}`))
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/ai-o1-mini-as-${code}`))
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/math-answers-${code}`))
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/math-geometry-${code}`))
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/solution-${code}`))
    // .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/solu-${code}`))
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/word-problems-${code}`))  
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/raw-${code}`))    
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/word-problems-tldr-${code}`))
    //.concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/word-problems-ai-${code}`))
    .concat(wordProblemsKeyValuePairs.map(([code,id]) => `/word-problem-${code}-n-${id}`))
    .concat(wordProblemsKeyValuePairs.map(([code,id]) => `/n-${code}-${id}`))
    .concat(quizes.map(d => `/quiz-${d.subject}-${d.period}`))
    .concat(quizes.map(d => `/quiz-print-${d.subject}-${d.period}`))
    .concat(quizes.map(d => `/quiz-picker-${d.subject}-${d.period}`))
    .concat(quizes.map(d => `/quiz-sel-${d.subject}-${d.period}`))
    .concat(quizes.map(d => `/quiz-builder-${d.subject}-${d.period}`))
    .concat(quizes.flatMap(d => printedPages.map(p => `/assets/pdf/${d.subject}-${d.period}/${formatPdfFileName(p)}.pdf`)))

};
