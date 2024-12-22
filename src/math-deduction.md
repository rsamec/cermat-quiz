---
title: Matimatika - dedukce
footer: false
pager: true
toc: true
style: /assets/css/math-deduce.css
---

<style>
  .proof figure {
    margin: 0px;
  }
  .bold {
    font-weight: 700;
  }
  .badge {
    display:inline;
    border-radius: 16px;
    padding: 0px 8px;
    font-weight: 900;
    background-color: var(--theme-foreground);
    color: var(--theme-background);
  }
  .badge--deduce {
      background-color: color-mix(in srgb, var(--theme-green), var(--theme-background) 70%);
      color: var(--theme-green);
  }
  .badge--output {
    background-color: color-mix(in srgb, var(--theme-red), var(--theme-background) 70%);
    color: var(--theme-red);
  }
</style>

```js
import {deduce} from './utils/deduce.js';
import {partion, relativeParts} from './utils/deduce-components.js';
import {inferenceRule,cont,sum, comp, ratio} from './utils/math.js';
import sourozenci from './math/sourozenci.js';
import pocetOb from './math/pocet-obyvatel.js';
import vOhrade from './math/kralice-a-slepice-v-ohrade.js';
import zakusky from './math/zakusek.js';
import milkExample from './math/mleko.js';


function renderExample({example, unit}={}){
  return html`
  <div class="card">
    ${example.template}
    <hr/>
    ${example.deductionTree}
    ${example.data != null ? partion(example.data, {unit}):''}
  </div>`
}
```

```js
const sourozenciInputForm = Inputs.form({
  evaPodil: Inputs.range([1, 40], {step: 1, value:40, label: "Eva - naspořený podíl (%)"}),
  michalPlus: Inputs.range([1, 100], {step: 1, value: 24, label: "Michal naspořil navíc (Kč)"}),
  zbyvaNasporit: Inputs.range([1, 100], {step: 1, value: 72, label: "Zbývá naspořit"})
});
const sourozenciInput = Generators.input(sourozenciInputForm);
```

## Sourozenci

<details>
  <summary>Parametrizace</summary>
  ${sourozenciInputForm}
</details>

${renderExample({example:sourozenci({input:sourozenciInput})})}



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

```js
const ohradaForm = Inputs.form({
  pocetHlav: Inputs.range([21, 101], {step: 2, value:37, label: "Počet hlave (králíci, slepice)"}),
  kralikuMene: Inputs.range([5, 21], {step: 2, value: 5, label: "králíků méně o"}),
});
const ohrada = Generators.input(ohradaForm);
```
## V ohradě

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
## Zákusek

<details>
  <summary>Parametrizace</summary>
  ${zakusekForm}
</details>

${renderExample({example:zakusky({input:zakusek})})}



----------------------

```js
const milkForm = Inputs.form({
  rozdil: Inputs.range([2, 50], {step: 1, value:5, label: "2 litry stojí méně o než 3 litry"}),
  zdrazeni: Inputs.range([0, 0.49], {step: 0.01, value:1/4, label: "Zdražení mléka o"}),
});
const milkInput = Generators.input(milkForm);
```
## Mléko

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
