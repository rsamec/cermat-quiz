---
title: Quiz viewer
theme: ["wide"]
sidebar: false
header: false
footer: false
pager: false
toc: true
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
const resourcesMap = await FileAttachment(`./data/quiz-answers-detail-gpt-4o.json`).json();
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
  resourcesMap
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
const codeComponent = (i) => useCode ? html`<h2>${formatCode(parameters.questions[i][0])}</h2>`: null
const renderedContent = html`<div class="v-stack v-stack--xxxl">${(layout === "grid-column") 
      ? renderedQuestions.map((d,index) => html`<div>
         ${codeComponent(index)}
         <div class="grid-column-auto">${d}</div>
      </div>`)  
    : (layout === "masonry")
      ? renderedQuestions.map((d,index) => html`<div>
        <summary>${codeComponent(index)}</summary>
        <section><masonry-layout gap=${gap ?? 10}>${d}<masonry-layout></section>
      </div>`)
      :renderedQuestions.map((d,index) => html`${codeComponent(index)}<div class="multi-column">${d}</div>`)
   }
  </div>`


display(renderedContent);

```