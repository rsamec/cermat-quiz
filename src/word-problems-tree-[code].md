---
title: Řešení úloh
source: české statní zkoušky
toc: false
footer: false
style: /assets/css/word-problems-tree.css
---


<link rel="stylesheet" data-theme="color" href="./data/gray-theme.css">

```js
import * as a from "npm:@appnest/masonry-layout";
import { parseQuiz } from './utils/quiz-parser.js';
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, formatCodeAlt, text } from './utils/quiz-string-utils.js';
import { deduceTraverse } from './utils/deduce-components.js';
import wordProblems, { } from './math/word-problems.js';
import { jsonToMarkdownChat } from "./utils/deduce-utils.js";
import mdPlus from "./utils/md-utils.js";

const code = observable.params.code;
const aiCategoriesData = await FileAttachment(`./data/quiz-categories-gemini-2.5-flash.json`).json();
const aiCategories = Object.fromEntries((aiCategoriesData[code]?.questions ?? []).map(d => [d.id, d]));

const rawContent = await FileAttachment(`./data/form-${observable.params.code}.md`).text();
const quiz = parseQuiz(rawContent);

const ids = quiz.questions.map(d => d.id);

const wordProblem = wordProblems[code];

const valuesMap = ids.map(id => {
  const values = (wordProblem?.[id] != null)
    ? [[id, wordProblem[id]]]
    : [1, 2, 3, 4]
      .map(i => `${id}.${i}`)
      .map(subId => wordProblem?.[subId])
      .filter(Boolean)
      .map((d, index) => [`${id}.${index + 1}`, d])
  return {id,values}
}).filter(({values}) => values.length > 0)

display(html`<h1>${formatCodeAlt(code)}</h1>`)

```

```js
display(html`<masonry-layout gap="10">
  ${valuesMap.map(({id,values}, i) => html`<figure class="group-${i+1} parallax-item" role="tabpanel">      
     <figcaption>
     <details>
      <summary>
        <span style="font-size: 1.6em; font-weight: 600">${id}. ${aiCategories[id]?.name ?? 'N/A'}</span>
      </summary>
      <div style="padding: 5px">${mdPlus.unsafe(quiz.content([id], { ids, render: 'content' }))}</div>
     </details>
     </figcaption>
     <div class="v-stack v-stack--m deduce-trees">${values.map(([key, value]) => html`${deduceTraverse(value.deductionTree)}`)}</div>
     </figure>`)}
</masonry-layout>`)
```
