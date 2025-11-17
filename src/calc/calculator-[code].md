---
title: Kalkulačka
theme: ["wide"]
sidebar: true
pager: true
footer: false
toc: false
style: /assets/css/calculator.css
---

```js

import { createMachine , createActor} from 'xstate';
import mdPlus from "../utils/md-utils.js";
import { parseQuiz } from '../utils/quiz-parser.js';
import { parseCode, formatCodeAlt } from '../utils/quiz-string-utils.js';
import { calcMachine, getNextEvents, getStateValueString, ArraySetMap } from './calculator.js';
import { extractAxiomsFromTree, getStepsFromTree } from "../utils/deduce-utils.js";
import wordProblems from '../math/word-problems.js';
import { convertTree, getAllLeafsWithAncestors } from '../utils/parse-utils.js';

import { signal } from '@preact/signals-core';
import { renderCalc } from "./calc-component.js";

const metadata = await FileAttachment(`../data/form-${observable.params.code}.json`).json();
const code = observable.params.code;
const leafs = getAllLeafsWithAncestors(convertTree(metadata));
const metadataMap = new Map(leafs.map(d => [d.leaf.data.id, d.leaf.data.node]));


const aiCategoriesData = await FileAttachment(`../data/quiz-categories-gemini-2.5-flash.json`).json();
const aiCategories = Object.fromEntries((aiCategoriesData[code]?.questions ?? []).map(d => [d.id, d]));

const rawContent = await FileAttachment(`../data/form-${observable.params.code}.md`).text();
const quiz = parseQuiz(rawContent);

const ids = quiz.questions.map(d => d.id);

function createAndBindSignals({metadata, inferenceMap}){    
    const {verifyBy} = metadata;
    
    // Create an actor that you can send events to.
    // Note: the actor is not started yet!    
    const actor = createActor(calcMachine, {input: {verifyBy, inferenceMap}});
    actor.start();    
    
    const snapshot = actor.getSnapshot();
    const context$ = signal(snapshot.context);
    const currentState$ = signal(getStateValueString(snapshot));
    const nextEvents$ = signal(getNextEvents(snapshot));

    actor.subscribe({
        next: state => {
            context$.value = {...state.context};
            currentState$.value = getStateValueString(state);
            nextEvents$.value = getNextEvents(state);     
        }
    });
    return {context$, currentState$, nextEvents$, actor}
}
display(html`<h1>${formatCodeAlt(code)}</h1>`)
```

```js

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



display(html`<div>
  ${valuesMap.map(({id,values}, i) => html`<div class="group-${i+1}" >
     <details open>
      <summary>
        <span style="font-size: 1.6em; font-weight: 600">${id}. ${aiCategories[id]?.name ?? 'N/A'}</span>
      </summary>
      <div style="padding: 5px">${mdPlus.unsafe(quiz.content([id], { ids, render: 'content' }))}</div>
     </details>
     <div class="v-stack v-stack--m">${values.map(([key, value]) => {
        const metadata = metadataMap.get(key.toString());
        const steps = getStepsFromTree(value.deductionTree);
        const inferenceMap = new ArraySetMap(steps);
        const bindings = createAndBindSignals({metadata, inferenceMap})
        
        return html`<div class="calc-view">${renderCalc({
            ...bindings,
            axioms: extractAxiomsFromTree(value.deductionTree),    
            steps:steps.map(([premises, _conclusion]) => premises),
            key,
        })}</div>`
    })}</div>
     </div>`)}
</div>`)
```

