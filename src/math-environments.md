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
import {computeTreeMetrics, jsonToMarkdownTree, jsonToMarkdownChat, highlight, generateAIMessages} from './utils/deduce-utils.js';
import mdPlus from './utils/md-utils.js';
import { html as rhtml } from './utils/reactive-htl.js';
import { signal, computed } from '@preact/signals-core';

import {autobus, autobus2} from './math/autobus.js';

```

```js

function renderChatButton(label, query){
  return html`<a style="height:34px;" href="#" onclick=${(e) => {
                    e.preventDefault();
                    window.open(`https://chat.openai.com/?q=${encodeURIComponent(query)}`)
                  }}><img style="height:34px;" src="https://img.shields.io/badge/chatGPT-74aa9c?style=for-the-badge&logo=openai&logoColor=white&label=${encodeURIComponent(label)}" alt="ChatGPT" /></a>`
}


function renderExample({example, unit, showRelativeValues}={}){
  const tree = deduceTraverse(example.deductionTree);  
  const {depth, width} = computeTreeMetrics(example.deductionTree);
  const renderType = Inputs.radio(new Map([['Textový strom','text-tree'],['Dedukční strom','deduce-tree'],['Textový chat','text-chat'],['Chat', 'chat'],['Chat dialog', 'stepper-chat']]), {value:'chat', label:'Zobrazit'})  
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
 
    
<div>${renderExample({example:autobus()})}</div>
<div>${renderExample({example:autobus2()})}</div>


