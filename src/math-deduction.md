---
title: Matematika - dedukce
footer: false
pager: true
toc: true
style: /assets/css/math-deduce.css
---

```js
import {deduce} from './utils/deduce.js';
import {partion, relativeParts, formatPredicate, relativePartsDiff} from './utils/deduce-components.js';
import {inferenceRule,cont,sum, comp, ratio, diff} from './utils/math.js';

import allRules from './utils/inference-rules.js';
import sourozenci from './math/sourozenci.js';
import pocetOb from './math/pocet-obyvatel.js';
import vOhrade from './math/kralice-a-slepice-v-ohrade.js';
import zakusky from './math/zakusek.js';
import milkExample from './math/mleko.js';
import vek from './math/vek.js';
import slepice from './math/slepice.js';

import proportionInverse from './math/proportion/proportion-inverse.js';
import proportion from './math/proportion/proportion.js';
import proportionCombined from './math/proportion/proportion-combined.js';

import percentPart from './math/percent/part.js';
import percentBase from './math/percent/base.js';
import percentPercentage from './math/percent/percentage.js';

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

function renderRules(rules){
  return rules.map(rule  => {
    const ddRule = inferenceRule(...rule.premises);
    return html`<div class="v-stack h-stack--m">    
      <div class="card">
      ${deduce(...rule.premises.map(d => formatPredicate(d)),formatPredicate(ddRule))}
      </div>
     
    </div>`
  })
}

const rules = allRules();
```

# Příklady

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

```js
  const entity = "hlava";
  const whole = cont("zaci", 50, entity);
  const part = cont("divky", 20,entity);
  const r = ratio({agent:"zaci",entity} , {agent:"divky", entity}, 1/3, entity);

  const dd1 = inferenceRule(whole, r);
  const partDeduce = deduce(whole, r, dd1);
  const wholeDeduce = deduce(part, r, inferenceRule(part, r));

```
--------------------------------

# Jak je to uděláno

```js
```

## Základní odvozovací pravidla

### Porovnání rozdílem - o kolik je větší / menší
${partion([
    {value: 2, agent:"Alice"},
    {value: 2, agent:"Bob"},
    {value: 4, agent:"Bob"},
  ],
  {unit:1, showSeparate: true, showRelativeValues: false })
}

${renderRules(rules.compare)}

### Porovnání podílem - kolikrát je větší / menší
${partion([
    {value: 2, agent:"Alice"},
    {value: 2, agent:"Bob"},
    {value: 2, agent:"Bob"},
    {value: 2, agent:"Bob"},
  ],
  {unit:2, showSeparate: true, showRelativeValues: false })
}
${renderRules(rules.ratioCompare)}

### Porovnávání - část z celku

${partion([
    {value: 30, agent:"chlapci", label:{ hidePercent: true, hideFraction: false} },
    {value: 90, agent:"dívky", label:{ hidePercent: true, hideFraction: false}},
  ],
  {unit:1, showRelativeValues: true, multiple:5 })
}
${renderRules(rules.partToWholeRatio)}

### Porovnávání - poměry část ku časti

${partion([
    {value: 30, agent:"chlapci", label:{ hidePercent: true, hideFraction: false} },
    {value: 90, agent:"dívky", label:{ hidePercent: true, hideFraction: false}},
  ],
  {unit:1, showRelativeValues: true, multiple:5 })
}
${renderRules(rules.partToPartRatio)}

### Rozdíl

${renderRules(rules.substract)}

### Rozdělování

${renderRules(rules.rate)}

----------------------

## Základní odvozovací vzory

```js
```

```js
const percentForm = Inputs.form({
  percentage: Inputs.range([1, 100], {step: 1, value: 20, label: "Procenta (%)"}),
  base: Inputs.range([500, 3000], {step: 50, value: 2000, label: "Základ"}),
  part: Inputs.range([1, 3000], {step: 1, value: 400, label: "Procentní část"}),
});
const percentInput = Generators.input(percentForm);
```
## Procenta

<details>
  <summary>Parametrizace</summary>
  ${percentForm}
</details>

### Výpočet procentní části

<div>${renderExample({example:percentPart({input:percentInput})})}</div>
<div class="h-stack h-stack--wrap">
${partion([
    {value: 100, agent:"vypůjčeno (základ)" },
    {value: percentInput.percentage, agent:"úrok (procetní část)"},
  ],
  {unit:1, showSeparate:true, showRelativeValues:false,  multiple:5,  width: 300, height: 100})
}
${partion([
    {value: percentInput.base, agent:"vypůjčeno (základ)" },
    {value: percentInput.percentage/100 * percentInput.base, agent:"úrok (procetní část)"},
  ],
  {unit:20, showSeparate:true, showRelativeValues:false,  multiple:5,  width: 300, height: 100})
}
</div>


### Výpočet základu

<div>${renderExample({example:percentBase({input:percentInput})})}</div>
<div class="h-stack h-stack--wrap">
${partion([
    {value: 100, agent:"vypůjčeno (základ)" },
    {value: percentInput.percentage, agent:"úrok (procetní část)"},
  ],
  {unit:1, showSeparate:true, showRelativeValues:false,  multiple:5,  width: 300, height: 100})
}
${partion([
    {value: percentInput.part / percentInput.percentage * 100 , agent:"vypůjčeno (základ)" },
    {value: percentInput.part, agent:"úrok (procetní část)"},
  ],
  {unit:20, showSeparate:true, showRelativeValues:false,  multiple:5,  width: 300, height: 100})
}
</div>


### Výpočet procent

<div>${renderExample({example:percentPercentage({input:percentInput})})}</div>

----------------------


```js
const propForm = Inputs.form({
  currentMachine: Inputs.range([2, 4], {step: 1, value: 4, label: "Nový počet strojů"}),
  previousMachine: Inputs.range([5, 50], {step: 1, value: 6, label: "Původní počet strojů"}),
  previousCount: Inputs.range([1, 50], {step: 1, value: 9, label: "Původní počet výrobků"}),
});
const propInput = Generators.input(propForm);
```
## Přímá úměrnost

<details>
  <summary>Parametrizace</summary>
  ${propForm}
</details>

<div>${renderExample({example:proportion({input:propInput})})}</div>

----------------------

```js
const proportionInverseForm = Inputs.form({
  currentMachine: Inputs.range([2, 4], {step: 1, value:4, label: "Nový počet strojů"}),
  previousMachine: Inputs.range([5, 50], {step: 1, value:6, label: "Původní počet strojů"}),
  previousHours: Inputs.range([1, 50], {step: 1, value:8, label: "Původní počet hodin"}),
});
const proportionInverseInput = Generators.input(proportionInverseForm);
```

## Nepřímá úměrnost

<details>
  <summary>Parametrizace</summary>
  ${proportionInverseForm}
</details>

<div>${renderExample({example:proportionInverse({input:proportionInverseInput})})}</div>

----------------------

```js
const proportionCombinedForms = Inputs.form({
  previousWorkers: Inputs.range([1, 10], {step: 1, value:6, label: "Původní počet dělníků"}),
  previousHours: Inputs.range([1, 10], {step: 1, value:9, label: "Původní počet hodin"}),
  currentWorkers: Inputs.range([10, 20], {step: 1, value:12, label: "Nový počet dělníků"}),
  previousGoods: Inputs.range([100, 1000], {step: 1, value:400, label: "Původní počet výrobků"}),
  currentGoods: Inputs.range([1000, 2000], {step: 1, value:1_600, label: "Nový počet výrobků"}),
  
});
const proportionCombinedInput = Generators.input(proportionCombinedForms);
```

## Kombinovaná přímá a nepřímá úměrnost

<details>
  <summary>Parametrizace</summary>
  ${proportionCombinedForms}
</details>

<div>${renderExample({example:proportionCombined({input:proportionCombinedInput})})}</div>

## Porovnávání s absolutním rozdílem

```js
const pribram = "Příbram";
const tabor = "Tábor" 
const entity = "obyvatel"


const celkem = "Tábor a Příbram";
const zbytek = "zbytek"

const total = cont(celkem, 75000, entity);
const difference = diff(celkem, zbytek, 4000, entity);
const comparison = comp(pribram, tabor, 4000, entity);
const dTree1 = inferenceRule(total,difference);

const eqRatio = ratio({agent:zbytek, entity}, {agent:tabor, entity}, 1/2, entity )
const dTree2 = inferenceRule(dTree1, eqRatio)

const partEqPredicate = {kind:'part-eq'}
const dTree0 = inferenceRule(total, comparison, partEqPredicate )

```

${deduce(
  deduce(formatPredicate(total), formatPredicate(difference), formatPredicate(dTree1)),
  formatPredicate(eqRatio), formatPredicate(dTree2)
)}

lze zjedušit pomocí ${formatPredicate(partEqPredicate)}

${deduce(formatPredicate(total), formatPredicate(comparison), formatPredicate(partEqPredicate), formatPredicate(dTree0))}


## Porovnání s relativním rozdílem


${relativePartsDiff(1/4,{first:"letos", second:"loni", asPercent: false})}
${relativePartsDiff(-1/4,{first:"letos", second:"loni", asPercent: false})}

-------------------------


```js
const slepiceForms = Inputs.form({
  previousWorkers: Inputs.range([0.5, 10], {step: 0.5, value:1.5, label: "Původní počet slepic"}),
  previousEggs: Inputs.range([0.5, 10], {step: 0.5, value:1.5, label: "Původní počet vajec"}),
  previousDays: Inputs.range([0.5, 10], {step: 0.5, value:1.5, label: "Původní počet dní"}),
  currentWorkers: Inputs.range([0.5, 10], {step: 0.5, value:3, label: "Nový počet slepic"}),
  currentDays: Inputs.range([0.5, 10], {step: 0.5, value:3, label: "Nový počet dní"}),
  
});
const slepiceInput = Generators.input(slepiceForms);
```

## Slepice hádanka

<details>
  <summary>Parametrizace</summary>
  ${slepiceForms}
</details>

<div>${renderExample({example:slepice({input:slepiceInput})})}</div>
