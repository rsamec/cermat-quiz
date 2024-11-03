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
const {layout, layoutPerQuiz, aligned, avoidBreakInsideQuiz, columnWidth} = parameters.displayOptions;

const maxQuestions = Math.max(...parameters.questions.map(d => d.length)) - 1;

const useColumns = layout === 'multiColumnPerQuiz' || layout === 'multiColumn';
const renderedContent = layout === 'column' && layoutPerQuiz
  ? html`<div data-testid="root" class="grid-column">${renderedQuestions.map((d,index) => html`<div class=${cls(['grid-column-child', aligned && 'grid-column-child--subgrid'])} style=${`grid-row: span ${maxQuestions}`}>${d}</div>`)}</div>`
  : layout === 'column' && !layoutPerQuiz
  ? html`<div data-testid="root" class="grid-column-auto">${renderedQuestions.map((d,index) => html.fragment`${d}`)}</div>`
  : layout === 'row' && layoutPerQuiz
    ? html`<div data-testid="root" class="grid-row">${renderedQuestions.map((d,index) => html`<div class=${cls(['grid-row-child', aligned && 'grid-row-child--subgrid'])} style=${`grid-column: span ${maxQuestions}`}>${d}</div>`)}</div>`
    : layout === 'row' && !layoutPerQuiz
    ? html`<div data-testid="root" class="grid-row-auto">${renderedQuestions.map((d,index) => html.fragment`${d}`)}</div>`
    : layout === 'multiColumn' && layoutPerQuiz
      ? html`<div data-testid="root">${renderedQuestions.map((d,index) => html`<div class=${cls([(layout ==='multiColumnPerQuiz' && index > 0) && 'break-before-page', useColumns && 'use-columns'])} style=${useColumns ? `columns:${columnWidth ?? 24}rem`:''}>${d}</div>`)}</div>`
      : layout === 'multiColumn' && !layoutPerQuiz
      ?  html`<div data-testid="root" class=${cls([useColumns && 'use-columns'])} style=${useColumns ? `columns:${columnWidth ?? 24}rem`:''}>${renderedQuestions.map((d,index) => html`<div class=${cls([avoidBreakInsideQuiz && 'break-inside-avoid-column'])}>${d}</div>`)}</div>`
      : layout === 'masonry' && !layoutPerQuiz
        ? html`<div data-testid="root"><masonry-layout>${renderedQuestions.map((d,index) => html.fragment`${d}`)}<masonry-layout></div>`
        : layout === 'masonry' && layoutPerQuiz
          ? html`<div data-testid="root">${renderedQuestions.map((d,index) => html`<masonry-layout>${d}<masonry-layout>`)}</div>`
          : layoutPerQuiz
            ? html`<div data-testid="root">${renderedQuestions.map((d,index) => html`${d}`)}</div>`
            : html`<div data-testid="root">${renderedQuestions.map((d,index) => html.fragment`${d}`)}</div>`;
      
display(renderedContent);

```