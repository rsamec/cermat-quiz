import { formatSubject, formatCode, formatPeriod, formatPdfFileName } from './src/utils/quiz-string-utils.js';
import { quizes, printedPages } from './src/utils/quiz-utils.js';
import wordProblems from './src/math/word-problems.js';
import { readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const codeRegex = /\$(.*?)\$/;
export function formatPeriodDate(period) {
  const [year, month, date] = period.split("-").map(d => parseInt(d));
  return new Date(year, month - 1, date).toLocaleDateString()
}
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
const wordProblemsKeyValuePairs = Object.entries(wordProblems).flatMap(([key, value]) => Object.keys(value).map(d => d.split('.')[0]).filter(unique).map(d => [key, d]));

const ctEduPath = resolve(`./src/ctedu`);
const ctEduFolders = readdirSync(ctEduPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);
const ctEduAssetsFiles = getFilesRecursive(`./src/ctedu`).filter(d => d.endsWith(".png")).map(d => d.replace("src", ""));

const cermatPath = resolve(`./src/cermat`);
const cermatFolders = readdirSync(cermatPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);
const cermatAssetsFiles = getFilesRecursive(`./src/cermat`).filter(d => d.endsWith(".png")).map(d => d.replace("src", ""));

// See https://observablehq.com/framework/config for documentation.
export default {
  // The app’s title; used in the sidebar and webpage titles.
  title: "Banka úloh",
  header: ({ title, data, path }) => title?.startsWith("CT_EDU") ? `${title.substring(6)} - ${formatPeriodDate(path.slice(-10))}` : codeRegex.test(title) ? title.replace(codeRegex, (_, __) => formatCode(path.slice(-8))) : title,
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
        { name: "Integrace", path: "/embedding" },
        { name: "AI", path: "/ai" },
        { name: "Mini aplikace", path: "/guides/math-trainer/index" },
        { name: "Automatizace NotebookLM", path: "/guides/notebook-lm/index" },
      ]
    },
    {
      open: false,
      name: "Mini aplikace",
      pages: [
        { name: "Matematický trenažér", path: "/math-trainer" },
      ]
    },
    {
      open: false,
      name: "Matematika",
      pages: [
        { name: "Slovní úlohy", path: "/word-problems-summary" },
        { name: "Výrazy, konstrukční úlohy", path: "/math" },
        { name: "Matematizace", path: "/math-deduction" },
        { name: "Analýza struktury slovních úloh", path: "/word-problems-structure" },
        { name: "Měření obtížnosti", path: "/word-problems-measure" },
        // { name: "Prostředí", path:"math-environments"},
      ]
    },
    {
      open: false,
      name: "Aktuality",
      pages: [
        { name: "Únor 2026", path: "/blog/2026-february/index" },
        { name: "Leden 2026", path: "/blog/2026-january/index" },
        { name: "Prosinec 2025", path: "/blog/2025-december/index" },
        { name: "Listopad 2025", path: "/blog/2025-november/index" },
        { name: "Říjen 2025", path: "/blog/2025-october/index" },
        { name: "Březen 2025", path: "/blog/2025-march/index" },
      ]
    },
    { name: "ČT EDU", path: "/ctedu/picker" },
    { name: "Nanečisto", path: "/cermat/picker" },
    { name: "Nastavení", path: "/user-settings" },
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
    .concat(ctEduAssetsFiles)
    .concat(cermatAssetsFiles)
    .concat(assetsFiles.concat("/assets/css/print-results.css"))
    .concat(['/components/quiz-html.js'])
    .concat(['/components/quiz.js'])
    .concat(['/components/quiz-store.js'])
    .concat(['/components/math.js'])
    .concat(['gpt-4o', 'o3-mini', 'gpt-5-mini', 'gemini-2.5-flash'].map(model => `/ai-results-${model}`))
    //.concat('/blog/20250330')
    .concat('/data/quiz-question.zip')
    .concat('/data/quiz-questions.zip')
    .concat('/data/word-problem.zip')
    .concat('/data/word-problems.zip')
    .concat(ctEduFolders.map(d => `/ctedu/print-${d}`))
    .concat(ctEduFolders.map(d => `/ctedu/arch-${d}`))
    .concat(ctEduFolders.map(d => `/ctedu/solution-${d}`))
    .concat(ctEduFolders.map(d => `/ctedu/word-problems-${d}`))
    .concat(ctEduFolders.map(d => `/ctedu/word-problems-${d}.tldr`))
    .concat(cermatFolders.map(d => `/cermat/print-${d}`))
    .concat(cermatFolders.map(d => `/cermat/arch-${d}`))
    .concat(cermatFolders.map(d => `/cermat/solution-${d}`))
    .concat(cermatFolders.map(d => `/ctedu/word-problems-${d}`))
    .concat(cermatFolders.map(d => `/ctedu/word-problems-${d}.tldr`))
    .concat(ctEduFolders.map(d => `/ctedu/form-${d}`))
    .concat(ctEduFolders.map(d => `/ctedu/chat-stepper-${d}`))
    .concat(ctEduFolders.map(d => `/ctedu/calculator-${d}`))
    .concat(ctEduFolders.map(d => `/ctedu/color-expression-${d}`))
    .concat(cermatFolders.flatMap(d => ['form', 'chatstepper', 'calculator', 'colorexpression'].map(app => `/apps/cermat-${app}-${d}`)))
    .concat(quizes.flatMap(d => d.codes).map(code => `/form-${code}`))
    .concat(quizes.flatMap(d => d.codes).map(code => `/print-${code}`))
    .concat(quizes.flatMap(d => d.codes).map(code => `/arch-${code}`))
    .concat(quizes.flatMap(d => d.codes).map(code => `/data/arch-${code}.schema.json`))
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/data/word-problems-${code}.md`))
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/data/word-problems-${code}.json`))
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/data/word-problems-${code}.tldr`))
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/data/math-answers-${code}.json`))
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/data/math-geometry-${code}.json`))
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).filter(code => code == "M9D-2025").map(code => `/notebook-${code}`))
    .concat(['o1-mini', 'gpt-5-mini', 'gemini-2.5-flash'].flatMap(model => quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/ai-${model}-as-${code}`)))
    // .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/extract-${code}`))
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/math-answers-${code}`))
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/math-geometry-${code}`))
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/solution-${code}`))
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/word-problems-tree-${code}`))
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/chat-stepper-${code}`))
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/calc/calculator-${code}`))
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/calc/color-expression-${code}`))
    // .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/solu-${code}`))
    .concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/word-problems-${code}`))
    //.concat(quizes.filter(d => d.subject == "math").flatMap(d => d.codes).map(code => `/word-problems-ai-${code}`))
    .concat(wordProblemsKeyValuePairs.map(([code, id]) => `/word-problem-${code}-n-${id}`))
    .concat(quizes.map(d => `/quiz-${d.subject}`))
    .concat(quizes.map(d => `/quiz-print-${d.subject}`))
    .concat(quizes.map(d => `/quiz-picker-${d.subject}-${d.period}`))
    .concat(quizes.map(d => `/quiz-sel-${d.subject}-${d.period}`))
    .concat(quizes.flatMap(d => printedPages.map(p => `/assets/pdf/cermat/${formatPdfFileName(p)}.pdf`)))
    .concat(quizes.flatMap(d => printedPages.map(p => `/assets/pdf/ctedu/${formatPdfFileName(p)}.pdf`)))
    .concat(quizes.flatMap(d => printedPages.map(p => `/assets/pdf/${d.subject}-${d.period}/${formatPdfFileName(p)}.pdf`)))

};
