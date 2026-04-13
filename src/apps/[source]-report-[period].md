---
title: Vyplňovačka - $code$
sidebar: true
pager: false
footer: false
toc: false
style: /assets/css/quiz-form.css
titleFormat: extractPath
---

```js
import { QuizStore } from '../utils/quiz-store.js';

const metadata = await FileAttachment(`../${observable.params.source}/${observable.params.period}/key.json`).json();
const answers = await FileAttachment(`../${observable.params.source}/ai-${observable.params.period}-o4-mini.json`).json();
const store = new QuizStore({metadata});
store.submitQuiz(answers ?? {})
const state = store.getState();
```

```js
html`Body: ${state.totalPoints}/${state.maxTotalPoints}`
```
```js
html`<pre>${JSON.stringify(state.answers, null, 2)}</pre>`
```