---
title: Didaktická prostředí
footer: false
pager: true
toc: true
style: /assets/css/math-deduce.css
---

```js
import {deduce} from './utils/deduce.js';
import {partion, relativeTwoParts, relativeTowPartsDiff, deduceTraverse, highlightLabel, renderChat } from './utils/deduce-components.js';
import { renderChatStepper, useInput } from './utils/deduce-chat.js';
import {inferenceRule, cont, sum, comp, ratio} from './components/math.js';
import {computeTreeMetrics, jsonToMarkdownTree, jsonToMarkdownChat, highlight, generateAIMessages, last} from './utils/deduce-utils.js';
import mdPlus from './utils/md-utils.js';
import { html as rhtml } from './utils/reactive-htl.js';
import { signal, computed } from '@preact/signals-core';
import {toEquation} from './utils/math-solver.js';

import {autobus, autobus2} from './math/autobus.js';


import wordProblems from './math/word-problems.js';

const MMA_2025 = wordProblems["MMA-2025"];
const M9I_2025 = wordProblems["M9I-2025"];
```

```js


// console.log(`Standard:${toEquation(last(MMA_2025["5.1"].deductionTree)).evaluate({d: 10})}`)
// console.log(`Power:${toEquation(last(MMA_2025["5.2"].deductionTree)).evaluate({d: 10, x: 3})}`)
function renderChatButton(label, query){
  return html`<a style="height:34px;" href="#" onclick=${(e) => {
                    e.preventDefault();
                    window.open(`https://chat.openai.com/?q=${encodeURIComponent(query)}`)
                  }}><img style="height:34px;" src="https://img.shields.io/badge/chatGPT-74aa9c?style=for-the-badge&logo=openai&logoColor=white&label=${encodeURIComponent(label)}" alt="ChatGPT" /></a>`
}


function renderExample({example, unit, showRelativeValues}={}){
  const tree = deduceTraverse(example.deductionTree);  
  const {depth, width} = computeTreeMetrics(example.deductionTree);
  const renderType = Inputs.radio(new Map([['Textový strom','text-tree'],['Dedukční strom','deduce-tree'],['Textový chat','text-chat'],['Chat', 'chat'],['Chat dialog', 'stepper-chat']]), {value:'text-tree', label:'Zobrazit'})  
  const renderType$ = useInput(renderType);

  const {explainSolution, vizualizeSolution, generateMoreQuizes} = generateAIMessages({template: example.template(highlight), deductionTrees:[["Řešení",example.deductionTree]]})

return html`
  <div class="v-stack v-stack--l">
    <div class="card">${mdPlus.unsafe(example.template())}</div>
    <div class="h-stack h-stack--m h-stack--wrap">
      <div  class="h-stack h-stack--m h-stack--wrap" style="flex:1">
        ${renderType}
      </div>
      <div class="h-stack h-stack--m h-stack--wrap" style="align-items: flex-start;">
        ${renderChatButton("Vysvětli", explainSolution)}
        ${renderChatButton("Vizualizuj", vizualizeSolution)}
        ${renderChatButton("Generuj více příkladů", generateMoreQuizes)}
      </div>
    </div>
    <div>
    ${rhtml`<div class=${computed(() => renderType$.value)}>
      ${html`<div class="viz viz--stepper-chat">${renderChatStepper(example.deductionTree)}</div>`}
      ${html`<div class="viz viz--chat">${renderChat(example.deductionTree)}</div>`}
      ${html`<div class="viz viz--deduce-tree"><div class="flexible">${deduceTraverse(example.deductionTree)}</div></div>`}
      ${html`<div class="viz viz--text-tree">${Inputs.button("Copy to clipboard",{value:null, reduce: () => navigator.clipboard.writeText(jsonToMarkdownTree(example.deductionTree).join(''))} )} ${mdPlus.unsafe(jsonToMarkdownTree(example.deductionTree).join(''))}</div>`}
      ${html`<div class="viz viz--text-chat">${mdPlus.unsafe(jsonToMarkdownChat(example.deductionTree).join('\n---\n'))}</div>`}
    </div>`}
  </div>`
}

```

# Slovní úlohy
```js
const okurkyForm = Inputs.form({
  salatyNavic: Inputs.range([1, 400], {step: 1, value: 4, label: "Saláty navíc o"}),
});
const okurkyInput = Generators.input(okurkyForm);
```

## Okurky a salaty

<details>
  <summary>Parametrizace</summary>
  ${okurkyForm}
</details>

<div>${renderExample({example:M9I_2025["6.1"]})}</div>

<div>${renderExample({example:MMA_2025["1"]})}</div>
<div>${renderExample({example:MMA_2025["5.1"]})}</div>
<div>${renderExample({example:MMA_2025["5.2"]})}</div>
<div>${renderExample({example:MMA_2025["6"]})}</div>
<div>${renderExample({example:MMA_2025["21"]})}</div>
<!-- <div>${renderExample({example:MMA_2025["8"]})}</div> -->
<div>${renderExample({example:autobus()})}</div>
<div>${renderExample({example:autobus2()})}</div>


