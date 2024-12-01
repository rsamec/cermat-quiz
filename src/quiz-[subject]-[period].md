---
title: Quiz viewer
theme: ["wide"]
sidebar: false
header: false
footer: false
pager: false
toc: false
style: /assets/css/quiz.css
---

<link rel="stylesheet" data-theme="gray" href="./data/gray-theme.css" disabled>
<link rel="stylesheet" data-theme="color" href="./data/color-theme.css" disabled>

```js
import * as a from "npm:@appnest/masonry-layout";
import { renderedQuestionsPerQuiz } from './components/quiz-form.js';
import { convertQueryParamToQuestions, cls} from './utils/string-utils.js';
import { formatCode } from './utils/quiz-string-utils.js';
const quizQuestionsMap = await FileAttachment(`./data/quiz-${observable.params.subject}-${observable.params.period}.json`).json();
//const resourcesMap = await FileAttachment(`./data/quiz-answers-detail-gpt-4o.json`).json();
const mathResourcesMap = await FileAttachment(`./data/math-answers.json`).json();
const searchParams = Object.fromEntries(new URLSearchParams(location.search));
```

```js
const parameters = ({
  questions: convertQueryParamToQuestions(searchParams.q),
  subject:observable.params.subject,
  quizQuestionsMap,
  displayOptions: {
    questionCustomClass:'break-inside-avoid-column',
    ...Object.fromEntries(Object.entries(searchParams).map(([key, value]) => ([key,value ==="true" ? true : value === "false"? false: value])))},
  mathResourcesMap
})

const renderedQuestions = renderedQuestionsPerQuiz(parameters);
const { theme, layout, useCode, gap } = parameters.displayOptions;

// const renderedContent = layoutPerQuiz
//     ? html`<div>${renderedQuestions.map((d,index) => html`<div class=${cls([(useColumns && index > 0) && 'break-before-page'])} style=${useColumns ? `columns:${columnWidth ?? 24}rem`:''}>${d}</div>`)}</div>`
//     : html`<div style=${useColumns ? `columns:${columnWidth ?? 24}rem`:''}>${renderedQuestions.map((d,index) => html`<div class=${cls([avoidBreakInsideQuiz && 'break-inside-avoid-column'])}>${d}</div>`)}</div>`;

const themeLink = document.querySelector(`link[data-theme="${theme}"]`);
if (themeLink != null){
  themeLink.disabled = false;
}
const codeComponent = (i) => useCode ? html`<span class="title">${formatCode(parameters.questions[i][0])}</span>`: null
const renderedContent =  html`<div class="v-stack v-stack--l">
        ${(layout === "grid-column") 
          ? renderedQuestions.map((d,index) => html`<details class="quiz-selector" open><summary>${codeComponent(index)}</summary><div class="grid-column-auto">${d}</div></details>`)
        : (layout === "masonry")
          ? renderedQuestions.map((d,index) => html`<details class="quiz-selector" open><summary>${codeComponent(index)}</summary><masonry-layout gap=${gap ?? 10  }>${d}<masonry-layout></details>`)
          :renderedQuestions.map((d,index) => html`<details class="quiz-selector" open><summary>${codeComponent(index)}</summary><div class="multi-column">${d}</div></details>`)
        }
  </div>`


display(renderedContent);

```