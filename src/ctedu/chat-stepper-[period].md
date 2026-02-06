---
title: CT_EDU Rozhodovačka
sidebar: true
pager: false
footer: false
toc: false
style: /assets/css/chat-stepper.css
titleFormat: extractPath
---

```js

import mdPlus from "../utils/md-utils.js";
import { parseQuiz } from '../utils/quiz-parser.js';
import wordProblems from './word-problems.js';
import { convertTree, getAllLeafsWithAncestors } from '../utils/parse-utils.js';
import {renderChatStepper} from '../utils/deduce-chat.js';
import { signal, computed } from '@preact/signals-core';
import { html as rhtml } from '../utils/reactive-htl.js';
import { formatPeriod, relativeBaseUrl } from "./utils.js";
import { normalizeImageUrlsToAbsoluteUrls } from "../utils/quiz-string-utils.js";

const metadata = await FileAttachment(`./${observable.params.period}/key.json`).json();
const rawContentData = await FileAttachment(`./${observable.params.period}/index.md`).text();
const rawContent = normalizeImageUrlsToAbsoluteUrls(rawContentData, [`${relativeBaseUrl}/${observable.params.period}`])

const period = observable.params.period;
const leafs = getAllLeafsWithAncestors(convertTree(metadata));
const metadataMap = new Map(leafs.map(d => [d.leaf.data.id, d.leaf.data.node]));
const quiz = parseQuiz(rawContent);

const ids = quiz.questions.map(d => d.id);
const wordProblem = wordProblems[period];

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

```

```js
display(html`<div>
  ${valuesMap.map(({id,values}, i) => html`<div class="group-${i+1}" role="tabpanel">
      <div style="padding: 5px">${mdPlus.unsafe(quiz.content([id], { ids, render: 'content' }))}</div>
     <div class="v-stack v-stack--m">${values.map(([key, value]) => {
          const toggle = signal(false)
          return rhtml`<details class="chat-stepper" open><summary><div class="h-stack h-stack--m h-stack-items--center" style="display:inline-flex"><span class="badge">Řešení úloha ${key}</span><button onclick=${() =>toggle.value = !toggle.value} }><i class="fa-solid fa-arrows-rotate"></i></button></div></summary><div>${computed(() => toggle.value ? renderChatStepper(value.deductionTree):renderChatStepper(value.deductionTree))}</div></details>`
    })}</div>
     </div>`)}
</div>`)
```

