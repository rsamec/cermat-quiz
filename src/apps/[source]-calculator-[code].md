---
title: CT_EDU Kalkulačka
sidebar: true
pager: false
footer: false
toc: false
style: /assets/css/calculator.css
titleFormat: extractPath
---

```js

import { createMachine , createActor} from 'xstate';
import mdPlus from "../utils/md-utils.js";
import { parseQuiz } from '../utils/quiz-parser.js';
import { calcMachine, getNextEvents, getStateValueString, ArraySetMap } from '../calc/calculator.js';
import { extractAxiomsFromTree, getStepsFromTree } from "../utils/deduce-utils.js";
import { convertTree, getAllLeafsWithAncestors } from '../utils/parse-utils.js';
import { signal } from '@preact/signals-core';
import { renderCalc } from "../calc/calc-component.js";
import { normalizeImageUrlsToAbsoluteUrls } from "../utils/quiz-string-utils.js";

const wordProblemsModule = await import(`../${observable.params.source}/word-problems.js`);
const wordProblems = wordProblemsModule.default;

const metadata = await FileAttachment(`../${observable.params.source}/${observable.params.code}/key.json`).json();
const rawContentData = await FileAttachment(`../${observable.params.source}/${observable.params.code}/index.md`).text();
const rawContent = normalizeImageUrlsToAbsoluteUrls(rawContentData, [`${observable.params.source}/${observable.params.code}`])
const code = observable.params.code;

const leafs = getAllLeafsWithAncestors(convertTree(metadata));
const metadataMap = new Map(leafs.map(d => [d.leaf.data.id, d.leaf.data.node]));
const quiz = parseQuiz(rawContent);
const ids = quiz.questions.map(d => d.id);

function createAndBindSignals({metadata, steps}){    
    const {verifyBy} = metadata;
    
    // Create an actor that you can send events to.
    // Note: the actor is not started yet!    
    const actor = createActor(calcMachine, {input: {
      verifyBy,
      inferenceMap: new ArraySetMap(steps)
      }});
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
     <div style="padding: 5px">${mdPlus.unsafe(quiz.content([id], { ids, render: 'content' }))}</div>
     <div class="v-stack v-stack--m">${values.map(([key, value]) => {
        const metadata = metadataMap.get(key.toString());
        const steps = getStepsFromTree(value.deductionTree);        
        const bindings = createAndBindSignals({metadata, steps})
        
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

