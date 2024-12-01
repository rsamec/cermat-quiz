---
title: Quiz viewer
theme: ["wide"]
sidebar: false
header: false
footer: false
pager: false
toc: true
style: /assets/css/print.css
---

```js
import { renderedQuestionsPerQuiz } from './components/quiz-form.js';
import { convertQueryParamToQuestions, cls} from './utils/string-utils.js';
import { formatCode } from './utils/quiz-string-utils.js';
const quizQuestionsMap = await FileAttachment(`./data/quiz-${observable.params.subject}-${observable.params.period}.json`).json();
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
})

const renderedQuestions = renderedQuestionsPerQuiz(parameters);
const { useCode, avoidBreakInsideQuiz } = parameters.displayOptions;
const renderedContent = useCode
    ? html`<div>${renderedQuestions.map((d,index) => html`<div class=${cls([index > 0 && 'break-before-page'])} style="columns:24rem">${d}</div>`)}</div>`
    : html`<div style="columns:24rem">${renderedQuestions.map((d,index) => html`<div class=${cls([avoidBreakInsideQuiz && 'break-inside-avoid-column'])}>${d}</div>`)}</div>`;



display(renderedContent);

```