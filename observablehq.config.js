import { quizes, formatSubject,formatPeriod } from './src/utils/quizes.js';

const unique =(value, index, array) =>  array.indexOf(value) === index;
const range = (start, end) => Array.from(
  Array(Math.abs(end - start) + 1), 
  (_, i) => start + i
);

// See https://observablehq.com/framework/config for documentation.
export default {
  // The app’s title; used in the sidebar and webpage titles.
  title: "Banka úloh",

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  pages: [
    {
      open: true,
      name: "Úlohy",
      pages: quizes.map(d => ({
        name: `${formatSubject(d.subject)} ${formatPeriod(d.period)}`,
        path: `/quiz-picker-${d.subject}-${d.period}`,
      }))
    },
    {
      open: true,
      name: "Testy",
      pages: quizes.map(d => ({
        name: `${formatSubject(d.subject)} ${formatPeriod(d.period)}`,
        path: `/quiz-summary-${d.subject}-${d.period}`,
      }))
    },
    {
      name: "Návody",
      pages:[
        {name: "Tisk", path: "/printing"},
        {name: "Sestavení úloh", path: "/builder"},
        {name: "Embedding", path: "/embedding"},
        {name: "AI", path: "/solver"},
      ]
    },
    {
      name: "Ostatní",
      pages:[
        {name: "Kategorie", path: "/dashboard"},
        // {name: "Layout", path: "/layout"},
      ]
    }
  ],
  globalStylesheets:['/assets/css/common/stacks.css'],
  // Content to add to the head of the page, e.g. for a favicon:
  head: `<link rel="icon" href="observable.png" type="image/png" sizes="32x32">
         <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
         <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tippy.js/6.3.7/tippy.min.css">
         <link rel="stylesheet" href="https://unpkg.com/tippy.js@6/themes/light-border.css">
         <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css">
         `,

  // The path to the source root.
  root: "src",  
  dynamicPaths:['/components/quiz.js']
  .concat(quizes.flatMap(d => d.codes).map(code => `/form-${code}`))
  .concat(quizes.flatMap(d => d.codes).map(code => `/print-${code}`))
  .concat(quizes.map(d => `/quiz-${d.subject}-${d.period}`))
  .concat(quizes.map(d => `/quiz-summary-${d.subject}-${d.period}`))
  .concat(quizes.map(d => `/quiz-picker-${d.subject}-${d.period}`))
  .concat([
    ['M9C-2023', range(0,9)],
    ['M9C-2024', range(0,5).concat([8,9,10])]
    ].flatMap(([code, ids]) => ids.map(id => `/assets/${code}/${id}.mp4`)))

};
