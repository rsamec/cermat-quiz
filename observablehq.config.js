import { quizes } from './src/utils/quizes.js';

// See https://observablehq.com/framework/config for documentation.
export default {
  // The app’s title; used in the sidebar and webpage titles.
  title: "Cermat úlohy",

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  // pages: [
  //   {
  //     name: "Examples",
  //     pages: [
  //       {name: "Dashboard", path: "/example-dashboard"},
  //       {name: "Report", path: "/example-report"}
  //     ]
  //   }
  // ],
  globalStylesheets:['/assets/css/stacks.css'],
  // Content to add to the head of the page, e.g. for a favicon:
  head: `<link rel="icon" href="observable.png" type="image/png" sizes="32x32">
         <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
         <link rel="stylesheet" href="https://unpkg.com/tippy.js@6/themes/light-border.css">
         `,

  // The path to the source root.
  root: "src",  
  dynamicPaths:['/components/quiz.ts']
  .concat(quizes.map(d => `/quiz-${d.subject}-${d.period}`))
  .concat(quizes.map(d => `/quiz-picker-${d.subject}-${d.period}`))
};
