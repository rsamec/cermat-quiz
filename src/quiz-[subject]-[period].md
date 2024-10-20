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

```js
import { renderedQuestionsPerQuiz } from './components/quiz-form.js';
import { convertQueryParamToQuestions, cls} from './utils/string-utils.js';
const quizQuestionsMap = await FileAttachment(`./data/quiz-${observable.params.subject}-${observable.params.period}.json`).json();
const searchParams = Object.fromEntries(new URLSearchParams(location.search));
```

```js
const parameters = ({
  questions: convertQueryParamToQuestions(searchParams.q),
  subject:observable.params.subject,
  quizQuestionsMap,
  displayOptions: {...Object.fromEntries(Object.entries(searchParams).map(([key, value]) => ([key,value ==="true" ? true : value === "false"? false: value])))}
})

const renderedQuestions = renderedQuestionsPerQuiz(parameters);
const {breakBetweenQuiz,avoidBreakInsideQuiz, useColumns,columnWidth} = parameters.displayOptions;


const renderedContent = breakBetweenQuiz 
  ? html`<div data-testid="root">${renderedQuestions.map((d,index) => html`<div class=${cls([(breakBetweenQuiz && index > 0) && 'break-before-page', useColumns && 'use-columns'])} style=${useColumns ? `columns:${columnWidth ?? 24}rem`:''}>${d}</div>`)}</div>`
  : html`<div data-testid="root" class=${cls([useColumns && 'use-columns'])} style=${useColumns ? `columns:${columnWidth ?? 24}rem`:''}>${renderedQuestions.map((d,index) => html`<div class=${cls([avoidBreakInsideQuiz && 'break-inside-avoid-column'])}>${d}</div>`)}</div>`;
display(renderedContent);

```