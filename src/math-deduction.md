---
title: Matematizace - dedukční stromy
footer: false
pager: true
toc: true
style: /assets/css/math-deduce.css
---

```js
import {deduce} from './utils/deduce.js';
import {partion, relativeParts, formatPredicate, relativePartsDiff, highlightLabel, deduceTraverse} from './utils/deduce-components.js';
import {inferenceRule,cont,sum, comp, ratio, compDiff} from './components/math.js';
import {computeTreeMetrics} from './utils/deduce-utils.js';

import allRules from './utils/inference-rules.js';
import slepice from './math/slepice.js';

import proportionInverse from './math/proportion/proportion-inverse.js';
import proportion from './math/proportion/proportion.js';
import proportionCombined from './math/proportion/proportion-combined.js';

import measureScale from './math/scale/measuring-scale.js';
import rectangle from './math/shapes/rectangle.js';
import cylinder from './math/shapes/cylinder.js';
import prism from './math/shapes/prism.js';

import percentPart from './math/percent/part.js';
import percentBase from './math/percent/base.js';
import percentPercentage from './math/percent/percentage.js';

function renderEx({example, unit, showRelativeValues}={}){
  const tree = deduceTraverse(example.deductionTree);
  const {depth, width} = computeTreeMetrics(example.deductionTree);
  return html`
  <div class="v-stack v-stack--l">
    <div class="card">${example.template(highlightLabel())}</div>
    <div class="h-stack h-stack--m">
      <h3 style="flex:1">Dedukční strom</h3>
      <div class="h-stack h-stack--m" style="align-items: flex-start;">
        <div class="badge">Hloubka: ${depth}</div>
        <div class="badge">Šířka: ${width}</div>
      </div>
    </div>
    <div class="flexible">
      ${tree}
    </div>
    ${example.data != null ? html`<div>
      <h3>Zobrazení situace</h3>
      ${partion(example.data, {unit, showRelativeValues})}
    </div>`:''}
  </div>`
}

function renderExample({example, unit, showRelativeValues}={}){  
  return html`
  <div class="v-stack v-stack--l">
    <div class="card">${example.template}</div>
    <div class="h-stack h-stack--m">
      <h3 style="flex:1">Dedukční strom</h3>
      <div class="h-stack h-stack--m" style="align-items: flex-start;">
      </div>
    </div>
    <div class="flexible">
      ${example.deductionTree}
    </div>
    ${example.data != null ? html`<div>
      <h3>Zobrazení situace</h3>
      ${partion(example.data, {unit, showRelativeValues})}
    </div>`:''}
  </div>`
}

function renderRules(rules){
  return html`<div  class="grid grid-cols-3">${rules.map(rule  => {
    const ddRule = inferenceRule(...rule.premises);    
    return html`<div> 
      <div class="card">
      
      ${deduce(...rule.premises.flatMap(d => d).map(d => formatPredicate(d)),formatPredicate(ddRule))}
      </div>
     
    </div>`
  })}</div>`
}

const rules = allRules();
const opacity = 0.3;
```

Řešení úlohy má podobu posloupnosti kroků ve formě __dedukčního stromu__.

- zadání úlohy je potřeba převést (text comprehension) na sadu __predikátů__ (formalizované pravdivé tvrzení)
- použít __odvozovací pravidla__ (inference rules) 
  - vstupem - seznam  __predikátů__, resp. __předpokladů__ (premises)
  - výstupem - jeden __predikát__
- výsledek úlohy získáme __průchodem stromu__ do hloubky (post-order), tj. aplikujeme __odvozovací pravidla__ až poté, co známe všechny vstupy (premises)


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

# Příklad - slepičí hádanka

<details>
  <summary>Parametrizace</summary>
  ${slepiceForms}
</details>

<div>${renderEx({example:slepice({input:slepiceInput})})}</div>

<div class="tip" label="Hloubka a šířka stromu">
Parametry dedukčního stromu může sloužit jako míra složitosti úlohy.
</div>

<a href="/math-deduction-examples">Více příkladů</a>

# Predikáty

Predikáty umožňují formalní zápis situačního modelu úlohy.

<table>
  <thead>
    <tr>
      <td>Predikát</td>
      <td>Vlastnosti</td>
      <td>Příklad</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><div class="badge">C</div> container</td>
      <td>(agent=Ája,</br>quantity=2,</br>entity=sešity)</td>
      <td>Ája má 2 sešity</td>
    </tr>
    <tr>
      <td><div class="badge">COMP</div> comparison</td>
      <td>(agentA=Ája,</br>agentB=Honzík,</br>quantity=7,</br>entity=sešity)</td>
      <td>Ája má o 7 sešitů více než Honzík </td>
    </tr>
    <tr>
      <td><div class="badge">COMP RATIO</div> comparison by ratio</td>
      <td>(agentA=Ája,</br>agentB=Honzík,</br>quantity=7,</br>entity=sešity)</td>
      <td>Ája má 7 krát více sešitů než Honzík</td>
    </tr>
    <tr>
      <td><div class="badge">COMP DIFF</div> comparison by difference</td>
      <td>(agentMinuend=celkem,</br>agentSubtrahend=Honzík,</br>quantity=7,</br>entity=sešity)</td>
      <td>Rozdíl mezi sešity celkem a Honzíkem je 7 sešitů./td>
    </tr>
    <tr>
      <td><div class="badge">RATIO</div> part to whole comparison</td>
      <td>(whole={agent:třída,entity:žáci},</br> part=chlapci,</br>ratio=1/4)</td>
      <td>Ve třídě je 1/4 chlapců ze všech žáků.</td>
    </tr>
    <tr>
      <td><div class="badge">RATIOS</div> part to part comparison</td>
      <td>(whole={agent:třída,entity:žáci},</br> parts=[chlapci,dívky],</br>ratios=[1,3])</td>
      <td>Poměr chlapců a dívek ve třídě je 1:3 (1 chlapec ku 3 dívkám).</td>
    </tr>
    <tr>
      <td><div class="badge">RATE</div> rate</td>
      <td>(agent=Ája,</br>quantity=3,</br>entity=Kč,</br>entityBase=rohlík)</td>
      <td>Každý rohlík, který má Ája, stojí 3 Kč.</td>
    </tr>
    <tr>
      <td><div class="badge">SUM</div> sumation</td>
      <td>(agentWhole=třída,</br>partAgents=[chlapci,dívky],</br>entityWhole=žáků)</td>
      <td>Počet chlapců a dívek dohromady dává počet žáků ve třídě.</td>
    </tr>
    <tr>
      <td><div class="badge">GCD</div> Greatest Common Divisor</td>
      <td>(agent=tyč,</br>entity=délka (m))</td>
      <td>Největší možná délka (m) tyče.</td>
    </tr>
    <tr>
      <td><div class="badge">LCD</div> Least Common Denominator</td>
      <td>(agent=skupina,</br>entity=osob)</td>
      <td>Nejmenší možná skupina osob.</td>
    </tr>    
    <tr>
      <td><div class="badge">COMMON SENSE</div> common sense</td>
      <td>(description=...)</td>
      <td>Nepřímá uměrnost. Je vztah mezi veličinami, kde je obracený poměr veličin.</td>
    </tr>
  </tbody>
</table>

# Odvozovací pravidla 

```js
```

## Porovnávání

### Porovnání - o kolik je větší / menší?

<div class="badge badge--large">COMP</div>

${partion([
    {value: 2, agent:"Aja", opacity},
    {value: 2, agent:"Honzík", opacity},
    {value: 4, agent:"Honzík"},
  ],
  {unit:1, showSeparate: true, showRelativeValues: false })
}

<div>${renderRules(rules.compare)}</div>

### Porovnání podílem - kolikrát je větší / menší?

<div class="badge badge--large">COMP-RATIO</div>

${partion([
    {value: 2, agent:"Aja", opacity},
    {value: 2, agent:"Honzík"},
    {value: 2, agent:"Honzík"},
    {value: 2, agent:"Honzík"},
  ],
  {unit:2, showSeparate: true, showRelativeValues: false })
}

<div>${renderRules(rules.ratioCompare)}</div>

### Porovnání rozdílem - kolik je rozdíl?

<div class="badge badge--large">COMP-DIFF</div>

${partion([
    {value: 2, agent:"Aja"},
    {value: 6, agent:"Honzík", opacity},
  ],
  {unit:1, showSeparate: false, showRelativeValues: false })
}

<div>${renderRules(rules.substract)}</div>


### Porovnávání - část z celku

<div class="badge badge--large">RATIO</div>

${partion([
    {value: 30, agent:"chlapci", label:{ hidePercent: true, hideFraction: false} },
    {value: 90, agent:"dívky", label:{ hidePercent: true, hideFraction: false}},
  ],
  {unit:1, showRelativeValues: true, multiple:5 })
}
<div>${renderRules(rules.partToWholeRatio)}</div>

### Porovnávání - poměry část ku časti

<div class="badge badge--large">RATIOS</div>

${partion([
    {value: 30, agent:"chlapci", label:{ hidePercent: true, hideFraction: false} },
    {value: 90, agent:"dívky", label:{ hidePercent: true, hideFraction: false}},
  ],
  {unit:1, showRelativeValues: true, multiple:5 })
}

<div>${renderRules(rules.partToPartRatio)}</div>


## Rozdělování

<div class="badge badge--large">RATE</div>
<div class="badge badge--large">QUOTA</div>

<div>${renderRules(rules.rate)}</div>


## Spojování
<div class="badge badge--large">SUM</div>
<div class="badge badge--large">PRODUCT</div>

<div>${renderRules(rules.sum)}</div>

## Největší společný dělitel
<div class="badge badge--large">GCD</div>
<div>${renderRules(rules.gcd)}</div>

## Nejmenší společný násobek
<div class="badge badge--large">LCD</div>
<div>${renderRules(rules.lcd)}</div>

## Posloupnosti
<div class="badge badge--large">SEQUENCE</div>

### Aritmetická
<div>${renderRules(rules.aritmeticSequence)}</div>

### Kvadratická
<div>${renderRules(rules.quadraticSequence)}</div>

### Geometrická
<div>${renderRules(rules.geometricSequence)}</div>



----------------------

# Základní odvozovací vzory

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

## Úměrnosti
### Přímá úměrnost

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

### Nepřímá úměrnost

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

### Kombinovaná přímá a nepřímá úměrnost

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
const difference = compDiff(celkem, zbytek, 4000, entity);
const comparison = comp(pribram, tabor, 4000, entity);
const dTree1 = inferenceRule(total,difference);

const eqRatio = ratio({agent:zbytek, entity}, {agent:tabor, entity}, 1/2, entity )
const dTree2 = inferenceRule(dTree1, eqRatio)

const partEqPredicate = {kind:'comp-part-eq'}
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


## Měřítko

```js
const measureScaleForm = Inputs.form({
  skutecnost: Inputs.range([1, 10], {step: 1, value:6, label: "Skutečná vzdálenost (km)"}),
  plan: Inputs.range([1, 10], {step: 1, value:3, label: "Velikost úsečky na mapě (cm)"}),

});
const measureScaleInput = Generators.input(measureScaleForm);
```


<details>
  <summary>Parametrizace</summary>
  ${measureScaleForm}
</details>

<div>${renderEx({example:measureScale({input:measureScaleInput})[0]})}</div>
<div>${renderEx({example:measureScale({input:measureScaleInput})[1]})}</div>
<div>${renderEx({example:measureScale({input:measureScaleInput})[2]})}</div>

## Tělesa

### Kvádr

```js
const rectangleForm = Inputs.form({
  length: Inputs.range([1, 10], {step: 1, value:4, label: "délka"}),
  width: Inputs.range([1, 10], {step: 1, value:3, label: "šířka"}),  
  height: Inputs.range([1, 10], {step: 1, value:2, label: "výška"}),
});
const rectangleInput = Generators.input(rectangleForm);
```


<details>
  <summary>Parametrizace</summary>
  ${rectangleForm}
</details>

<div>${renderEx({example:rectangle({input:rectangleInput})[0]})}</div>
<div>${renderEx({example:rectangle({input:rectangleInput})[1]})}</div>
<div>${renderEx({example:rectangle({input:rectangleInput})[2]})}</div>

### Válec

```js
const cylinderForm = Inputs.form({
  diameter: Inputs.range([1, 10], {step: 1, value:4, label: "průměr podstavy"}),
  height: Inputs.range([1, 10], {step: 1, value:2, label: "výška"}),
});
const cylinderInput = Generators.input(cylinderForm);
```


<details>
  <summary>Parametrizace</summary>
  ${cylinderForm}
</details>

<div>${renderEx({example:cylinder({input:cylinderInput})[0]})}</div>
<div>${renderEx({example:cylinder({input:cylinderInput})[1]})}</div>
<div>${renderEx({example:cylinder({input:cylinderInput})[2]})}</div>


### Trojboký hranol

```js
const triangleForm = Inputs.form({
  a: Inputs.range([1, 10], {step: 1, value:2, label: "strana a"}),
  b: Inputs.range([1, 10], {step: 1, value:3, label: "strana b"}),
  c: Inputs.range([1, 10], {step: 1, value:4, label: "strana c"}),
  aHeight: Inputs.range([1, 10], {step: 1, value:4, label: "výška ke straně a"}),
  height: Inputs.range([1, 10], {step: 1, value:2, label: "výška"}),
});
const triangleInput = Generators.input(triangleForm);
```


<details>
  <summary>Parametrizace</summary>
  ${triangleForm}
</details>

<div>${renderEx({example:prism({input:triangleInput})[0]})}</div>
<div>${renderEx({example:prism({input:triangleInput})[1]})}</div>
<div>${renderEx({example:prism({input:triangleInput})[2]})}</div>


# Jak je to uděláno?

Inspirováno prací [MathGAP](https://arxiv.org/pdf/2410.13502).

Můžete použít jako javascript module.

<script type="module">
import {cont, inferenceRule} from "https://www.cermatdata.cz/components/math.js";

const result = inferenceRule(
  cont("půjčka", 300, "Kč"),
  inferenceRule(
    cont("úrok", 20, "%"),
    cont("půjčka", 100, "%"),
    { kind: 'ratio' }
  )
);

console.log(`Výsledek: ${result.agent} = ${result.quantity} ${result.entity}`)


</script>

```html run=false

<script type="module">
import {cont, inferenceRule} from "https://www.cermatdata.cz/components/math.js";

const result = inferenceRule(
  cont("půjčka", 300, "Kč"),
  inferenceRule(
    cont("úrok", 20, "%"),
    cont("půjčka", 100, "%"),
    { kind: 'ratio' }
  )
);

//Výsledek: úrok = 60 Kč
console.log(`Výsledek: ${result.agent} = ${result.quantity} ${result.entity}`)

</script>
```
## API 

### Predicates

```typescript
export declare type Predicate = Container | Comparison | RatioComparison | Transfer | Rate | Combine | PartWholeRatio | PartToPartRatio | ComparisonDiff | CommonSense | GCD | LCD;
export declare function cont(agent: string, quantity: number, entity: string): Container;
export declare function comp(agentA: string, agentB: string, quantity: number, entity: string): Comparison;
export declare function compRatio(agentA: string, agentB: string, quantity: number, entity: string): RatioComparison;
export declare function compDiff(agentMinuend: string, agentSubtrahend: string, quantity: number, entity: string): ComparisonDiff;
export declare function ratio(whole: EntityMatcher, part: EntityMatcher, ratio: number): PartWholeRatio;
export declare function ratios(whole: EntityMatcher, parts: EntityMatcher[], ratios: number[]): PartToPartRatio;
export declare function sum(wholeAgent: string, partAgents: string[], wholeEntity: string, partEntity: string): Combine;
export declare function gcd(agent: string, entity: string): GCD;
export declare function lcd(agent: string, entity: string): LCD;
export declare function rate(agent: string, quantity: number, entity: string, entityBase: string): Rate;
export declare function commonSense(description: string): CommonSense;
```

### Inference rule

```typescript
export declare function inferenceRule(a: Predicate | Container[], b: Predicate, c?: {
    kind: 'ratio' | 'comp-ratio' | 'rate' | "comp-diff" | 'comp-part-eq';
})
```