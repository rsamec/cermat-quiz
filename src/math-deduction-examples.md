---
title: Matematika - slovní úlohy
footer: false
pager: true
toc: true
style: /assets/css/math-deduce.css
---

```js
import {deduce} from './utils/deduce.js';
import {partion, relativeParts, relativePartsDiff, deduceTraverse, highlightLabel, renderChat } from './utils/deduce-components.js';
import { renderChatStepper, useInput } from './utils/deduce-chat.js';
import {inferenceRule, cont, sum, comp, ratio} from './components/math.js';
import {computeTreeMetrics, jsonToMarkdownTree, jsonToMarkdownChat, highlight, generateAIMessages} from './utils/deduce-utils.js';
import mdPlus from './utils/md-utils.js';
import { html as rhtml } from './utils/reactive-htl.js';
import { signal, computed } from '@preact/signals-core';

//import milkExample from './math/mleko.js';

import cetar from './math/M7A-2023/cetar.js';
import zakusky from './math/M7A-2023/zakusek.js';

import sportovci from './math/M7A-2024/pocet-sportovcu.js';
import tabor from './math/M7A-2024/letni-tabor.js';
import vOhrade from './math/M7A-2024/kralice-a-slepice-v-ohrade.js';

import svadleny from './math/M9A-2024/svadleny.js';
import {example3} from './math/M9A-2024/kolo.js';

import sourozenci from './math/M9C-2024/sourozenci.js';
import pocetOb from './math/M9C-2024/pocet-obyvatel.js';

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
  const renderType = Inputs.radio(new Map([['Textový strom','text-tree'],['Dedukční strom','deduce-tree'],['Textový chat','text-chat'],['Chat', 'chat'],['Chat dialog', 'stepper-chat']]), {value:'stepper-chat', label:'Zobrazit'})  
  const renderType$ = useInput(renderType);

  const {explainSolution, vizualizeSolution, generateMoreQuizes} = generateAIMessages({template: example.template(highlight), deductionTrees:[["Řešení",example.deductionTree]]})
return html`
  <div class="v-stack v-stack--l">
    <div class="card">${example.template(highlightLabel())}</div>
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

Řešené slovní úlohy pomocí dedukčních stromů.

```js
const koloForm = Inputs.form({
  base: Inputs.range([10_000, 50_000], {step: 1000, value:20_000, label: "Cena"}),
  percentageDown: Inputs.range([5, 25], {step: 1, value: 10, label: "Zlevnění o %"}),
  percentageNewUp: Inputs.range([5, 25], {step: 1, value: 10, label: "Zdražení o %"}),
});
const koloInput = Generators.input(koloForm);
```

## Cena kola

<details>
  <summary>Parametrizace</summary>
  ${koloForm}
</details>
    
<div>${renderExample({example:example3({input:koloInput}), unit: 1000, showRelativeValues: false})}</div>

----------------------

```js
const cetarForm = Inputs.form({
  kapitan: Inputs.range([1, 5], {step: 1, value:1, label: "Počet kapitánů"}),
  porucik: Inputs.range([1, 10], {step: 1, value:4, label: "Počet poručíků"}),
  cetarPerPorucik: Inputs.range([1,20], {step: 1, value:3, label: "Četařů za každého kapitán"}),
  vojinPerCetar: Inputs.range([1, 20], {step: 1, value:10, label: "Vojínů za každého četaře"}),
});
const cetarInput = Generators.input(cetarForm);
```

## Rota

<details>
  <summary>Parametrizace</summary>
  ${cetarForm}
</details>
    
<div>${renderExample({example:cetar({input:cetarInput})})}</div>

----------------------

```js
const taborForm = Inputs.form({
  zdravotnik: Inputs.range([1, 5], {step: 1, value:1, label: "Počet zdravotníků"}),
  kucharPerZdravotnik: Inputs.range([1, 10], {step: 1, value:4, label: "Kuchařek na každého zdravotníka"}),
  vedouciPerKuchar: Inputs.range([1,10], {step: 1, value:2, label: "Vedoucí za každou kuchařku"}),
  instruktorPerVedouci: Inputs.range([1,10], {step: 1, value:2, label: "Instruktorů za každého vedoucího"}),
  ditePerInstruktor: Inputs.range([1, 10], {step: 1, value:4, label: "Dětí za každého instruktora"}),
});
const taborInput = Generators.input(taborForm);
```

## Letni tabor

<details>
  <summary>Parametrizace</summary>
  ${taborForm}
</details>
    
<div>${renderExample({example:tabor({input:taborInput})[0]})}</div>
<div>${renderExample({example:tabor({input:taborInput})[1]})}</div>
<div>${renderExample({example:tabor({input:taborInput})[2]})}</div>

----------------------


## Sportovci

    
<div>${renderExample({example:sportovci({input:{}})})}</div>

----------------------

```js
const pocetObyvatelForm = Inputs.form({
  celkem: Inputs.range([50_000, 100_000], {step: 10, value:86_200, label: "Jihlava + Třebíč"}),
  jihlavaPlus: Inputs.range([10_000, 30_000], {step: 2, value: 16_200, label: "Jihlava více o"}),
});
const pocetObyvatel = Generators.input(pocetObyvatelForm);
```

## Počet obyvatel

<details>
  <summary>Parametrizace</summary>
  ${pocetObyvatelForm}
</details>
    
<div>${renderExample({example:pocetOb({input:pocetObyvatel}), unit: 1000, showRelativeValues: false})}</div>

----------------------

```js
const ohradaForm = Inputs.form({
  pocetHlav: Inputs.range([21, 101], {step: 2, value:37, label: "Počet hlave (králíci, slepice)"}),
  kralikuMene: Inputs.range([5, 21], {step: 2, value: 5, label: "králíků méně o"}),
});
const ohrada = Generators.input(ohradaForm);
```

## Králíci a slepice v ohradě

<details>
  <summary>Parametrizace</summary>
  ${ohradaForm}
</details>

<div>${renderExample({example:vOhrade({input:ohrada})})}</div>

----------------------

```js
const zakusekForm = Inputs.form({
  cena: Inputs.range([30, 200], {step: 2, value:72, label: "Cena zákusku č.1"}),
});
const zakusek = Generators.input(zakusekForm);
```
## Cena zákusků

<details>
  <summary>Parametrizace</summary>
  ${zakusekForm}
</details>

<div>${renderExample({example:zakusky({input:zakusek})})}</div>


----------------------

```js
const sourozenciInputForm = Inputs.form({
  evaPodil: Inputs.range([1, 40], {step: 1, value:40, label: "Eva - naspořený podíl (%)"}),
  michalPlus: Inputs.range([1, 100], {step: 1, value: 24, label: "Michal naspořil navíc (Kč)"}),
  zbyvaNasporit: Inputs.range([1, 100], {step: 1, value: 72, label: "Zbývá naspořit"})
});
const sourozenciInput = Generators.input(sourozenciInputForm);
```

## Šetření sourozenců na dárek

<details>
  <summary>Parametrizace</summary>
  ${sourozenciInputForm}
</details>

<div>${renderExample({example:sourozenci({input:sourozenciInput})})}</div>

----------------------


```js
const vekForm = Inputs.form({
  vekRozdil: Inputs.range([6, 50], {step: 2, value:6, label: "Věkový rozdíl"}),
});
const vekInput = Generators.input(vekForm);
```

```js
const workersForms = Inputs.form({
  previousWorker: Inputs.range([5, 10], {step: 1, value:5, label: "Původní počet švadlen"}),
  previousHours: Inputs.range([1, 50], {step: 1, value:24, label: "Původní počet hodin"}),
  currentWorker: Inputs.range([2, 4], {step: 1, value:4, label: "Nový počet švadlen"}),
});
const workersInput = Generators.input(workersForms);
```

## Švadleny

<details>
  <summary>Parametrizace</summary>
  ${workersForms}
</details>

<div>${renderExample({example:svadleny({input:workersInput})})}</div>

----------------------

```js
const milkForm = Inputs.form({
  rozdil: Inputs.range([2, 50], {step: 1, value:5, label: "2 litry stojí méně o než 3 litry"}),
  zdrazeni: Inputs.range([0, 0.49], {step: 0.01, value:1/4, label: "Zdražení mléka o"}),
});
const milkInput = Generators.input(milkForm);
```

