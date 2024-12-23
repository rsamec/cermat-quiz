---
title: Matimatika - dedukce
footer: false
pager: true
toc: true
style: /assets/css/math-deduce.css
---

```js
import {deduce} from './utils/deduce.js';
import {partion, relativeParts} from './utils/deduce-components.js';
import {inferenceRule,cont,sum, comp, ratio} from './utils/math.js';
import sourozenci from './math/sourozenci.js';
import pocetOb from './math/pocet-obyvatel.js';
import vOhrade from './math/kralice-a-slepice-v-ohrade.js';
import zakusky from './math/zakusek.js';
import milkExample from './math/mleko.js';
import vek from './math/vek.js';


function renderExample({example, unit}={}){
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
      ${partion(example.data, {unit})}
    </div>`:''}
  </div>`
}
```

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
    
${renderExample({example:pocetOb({input:pocetObyvatel}), unit: 1000})}

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

${renderExample({example:vOhrade({input:ohrada})})}

```js
  const whole = cont("zaci", 50, "hlava");
  const part = cont("divky", 20,"hlava");
  const r = ratio("zaci", "divky", 1/3, "hlava");

  const dd1 = inferenceRule(whole, r);
  const partDeduce = deduce(whole, r, dd1);
  const wholeDeduce = deduce(part, r, inferenceRule(part, r));

```

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

${renderExample({example:zakusky({input:zakusek})})}


----------------------

```js
const sourozenciInputForm = Inputs.form({
  evaPodil: Inputs.range([1, 40], {step: 1, value:40, label: "Eva - naspořený podíl (%)"}),
  michalPlus: Inputs.range([1, 100], {step: 1, value: 24, label: "Michal naspořil navíc (Kč)"}),
  zbyvaNasporit: Inputs.range([1, 100], {step: 1, value: 72, label: "Zbývá naspořit"})
});
const sourozenciInput = Generators.input(sourozenciInputForm);
```

## Šetření souurozenců na dárek

<details>
  <summary>Parametrizace</summary>
  ${sourozenciInputForm}
</details>

${renderExample({example:sourozenci({input:sourozenciInput})})}

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

${renderExample({example:milkExample({input:milkInput})})}

```js
  const whole = cont("zaci", 50, "hlava");
  const part = cont("divky", 20,"hlava");
  const r = ratio("zaci", "divky", 1/3, "hlava");

  const dd1 = inferenceRule(whole, r);
  const partDeduce = deduce(whole, r, dd1);
  const wholeDeduce = deduce(part, r, inferenceRule(part, r));

```
----------------------

```js
const vekForm = Inputs.form({
  vekRozdil: Inputs.range([6, 50], {step: 2, value:6, label: "Věkový rozdíl"}),
});
const vekInput = Generators.input(vekForm);
```