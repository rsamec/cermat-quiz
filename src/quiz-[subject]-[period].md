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

```js
import { renderedQuestionsPerQuiz } from './components/quiz-form.js';
import { convertQueryParamToQuestions, cls} from './utils/string-utils.js';
const quizQuestionsMap = await FileAttachment(`./data/quiz-${observable.params.subject}-${observable.params.period}.json`).json();
const resourcesMap = await FileAttachment(`./data/quiz-answers-detail-gpt-4o.json`).json();
const searchParams = Object.fromEntries(new URLSearchParams(location.search));
```

```js
const parameters = ({
  questions: convertQueryParamToQuestions(searchParams.q),
  subject:observable.params.subject,
  quizQuestionsMap,
  displayOptions: {...Object.fromEntries(Object.entries(searchParams).map(([key, value]) => ([key,value ==="true" ? true : value === "false"? false: value])))},
  resourcesMap
})

const renderedQuestions = renderedQuestionsPerQuiz(parameters);
const { layoutPerQuiz, columnWidth, avoidBreakInsideQuiz, useColumns} = parameters.displayOptions;

const renderedContent = layoutPerQuiz
    ? html`<div>${renderedQuestions.map((d,index) => html`<div class=${cls([(useColumns && index > 0) && 'break-before-page'])} style=${useColumns ? `columns:${columnWidth ?? 24}rem`:''}>${d}</div>`)}</div>`
    : html`<div style=${useColumns ? `columns:${columnWidth ?? 24}rem`:''}>${renderedQuestions.map((d,index) => html`<div class=${cls([avoidBreakInsideQuiz && 'break-inside-avoid-column'])}>${d}</div>`)}</div>`;
      
display(renderedContent);

```