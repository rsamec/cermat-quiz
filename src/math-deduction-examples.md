---
title: Matematika - slovní úlohy
footer: false
pager: true
toc: true
style: /assets/css/math-deduce.css
---

```js
import {deduce} from './utils/deduce.js';
import {partion, relativeParts, formatPredicate, relativePartsDiff} from './utils/deduce-components.js';
import {inferenceRule, cont, sum, comp, ratio} from './components/math.js';

import sourozenci from './math/sourozenci.js';
import pocetOb from './math/pocet-obyvatel.js';
import vOhrade from './math/kralice-a-slepice-v-ohrade.js';
import zakusky from './math/zakusek.js';
import milkExample from './math/mleko.js';
import vek from './math/vek.js';
import slepice from './math/slepice.js';
import kolo from './math/M9A-2024/kolo.js';
import cetar from './math/M7A-2023/cetar.js';
import sportovci from './math/M7A-2023/pocet-sportovcu.js';


import svadleny from './math/svadleny.js';

function renderExample({example, unit, showRelativeValues}={}){
  const {depth, width} = example.deductionTree._statistics;
  return html`
  <div class="v-stack v-stack--l">
    <div class="card">${example.template}</div>
    <div class="h-stack h-stack--m">
      <h3 style="flex:1">Dedukční strom</h3>
      <div class="h-stack h-stack--m" style="align-items: flex-start;">
        <div class="badge">Hloubka: ${depth}</div>
        <div class="badge">Šířka: ${width}</div>
      </div>
    </div>
    <div>
      ${example.deductionTree}
    </div>
    ${example.data != null ? html`<div>
      <h3>Zobrazení situace</h3>
      ${partion(example.data, {unit, showRelativeValues})}
    </div>`:''}
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
    
<div>${renderExample({example:kolo({input:koloInput}), unit: 1000, showRelativeValues: false})}</div>

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
  cena: Inputs.range([30, 200], {step: 2, value:86, label: "Cena zákusku č.1"}),
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
const milkForm = Inputs.form({
  rozdil: Inputs.range([2, 50], {step: 1, value:5, label: "2 litry stojí méně o než 3 litry"}),
  zdrazeni: Inputs.range([0, 0.49], {step: 0.01, value:1/4, label: "Zdražení mléka o"}),
});
const milkInput = Generators.input(milkForm);
```
## Zdražení mléka

<details>
  <summary>Parametrizace</summary>
  ${milkForm}
</details>

<div>${renderExample({example:milkExample({input:milkInput})})}</div>

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

