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
import { renderQuiz } from './components/quiz-form.js';
import { convertQueryParamToQuestions } from './utils/string-utils.js';
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
const quizWithControls = renderQuiz(parameters);
display(renderQuizInColumns(html`${quizWithControls.map(d=> d)}`));
```

```js
function renderQuizInColumns(content){ 
  const columns= searchParams.columns;
  return html`<div style="columns:${columns}">${content}</div>`
}

```