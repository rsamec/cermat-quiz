---
title: Zadání
theme: ["wide"]
sidebar: false
header: false
footer: false
pager: false
toc: false
style: /assets/css/print.css
titleFormat: extractPath
---

```js
import { parseQuiz } from '../utils/quiz-parser.js';
import mdPlus from '../utils/md-utils.js';
import { normalizeImageUrlsToAbsoluteUrls } from "../utils/quiz-string-utils.js";

const rawContentData = await FileAttachment(`../${observable.params.source}/${observable.params.code}/index.md`).text();        
const rawContent = normalizeImageUrlsToAbsoluteUrls(rawContentData, [`../${observable.params.source}/${observable.params.code}`])
const quiz = parseQuiz(rawContent);
const code = observable.params.code;

const searchParams = Object.fromEntries(new URLSearchParams(location.search));
const queryQuestions = (searchParams.q ?? "").split(",").map(d => parseInt(d, 10));


const ids = queryQuestions.length == 0 
  ? quiz.questions.map(d => d.id)
  : quiz.questions.map(d => d.id).filter(d => queryQuestions.includes(d));
```

```js
html`<div data-testid="root" class="root">${ids.map(id => html.fragment`${mdPlus.unsafe(quiz.content([id],{ ids, render:'content'}), {docId:`${code}-${id}` })}`)}</div>`
```