---
title: Matematizace - dedukční stromy
footer: false
pager: true
toc: true
style: /assets/css/math-deduce.css
---

```js
import {deduce} from './utils/deduce.js';
import {partion, highlightLabel, deduceTraverse, formatting} from './utils/deduce-components.js';
import {inferenceRule,cont,sum, comp, ratio, compDiff} from './components/math.js';
import {computeTreeMetrics, formatPredicate} from './utils/deduce-utils.js';

import allRules from './utils/inference-rules.js';
import slepice from './math/slepice.js';

import proportionInverse from './math/proportion/proportion-inverse.js';
import proportion from './math/proportion/proportion.js';
import proportionCombined from './math/proportion/proportion-combined.js';

import measureScale from './math/scale/measuring-scale.js';
import {examples as rectangleExamples} from './math/shapes/rectangle.js';
import {examples as cylinderExamples} from './math/shapes/cylinder.js';
import {examples as prismExamples} from './math/shapes/prism.js';

import {example as percentPart} from './math/percent/part.js';
import {example as percentBase} from './math/percent/base.js';
import {example as percentPercentage} from './math/percent/percentage.js';

import {autobus} from './math/autobus.js';

import  {examplePartToWhole, exampleComparePartToWhole,exampleCompareMultiple, exampleCompareTotalMultiple, exampleDiffPartToWhole, examplePartEq}  from './math/comp/comp.js'

function renderEx({example, unit, showRelativeValues}={}){
  const tree = deduceTraverse(example.deductionTree);
  const {depth, width} = computeTreeMetrics(example.deductionTree);
  return html`
  <div class="v-stack v-stack--l">
    <div class="card">${example.template(highlightLabel())}</div>
    <div class="h-stack h-stack--m">
      <h3 style="flex:1"></h3>
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

function renderRules(rules){
  return html`<div  class="grid grid-cols-3">${rules.map(rule  => {
    const ddRule = inferenceRule(...rule);
    return html`<div> 
      <div class="card">
      
      ${deduce(...rule.flatMap(d => d).map(d => formatPredicate(d,formatting)),formatPredicate(ddRule,formatting))}
      </div>
     
    </div>`
  })}</div>`
}

const rules = allRules();
const opacity = 0.3;
```

Slovní úlohy jsou řešeny rozložením na podproblémy, které jsou řešitelné pomocí jednoduchých početních operacích.

<div class="tip" label="Řešení logickou úvahou">
  Žádné zavádění proměných. Žádné sestavování rovnic. Žádné složité výpočty.
</div>

Zápis řešení je ve formě dedukčního stromu a slouží jako __strukturovaná reprezentace řešení__ úlohy.

Řešení úlohy je rozděleno na posloupnost __jednoduchých kroků__. Pořadí a návaznosti jednotlivých kroků definuje  dedukčního strom, kde __kroky__ jsou __uzly stromu__ a __vrchol stromu__ je __konečný výsledek__.

Podrobnosti a příklady, jak vytvořit dedukční strom [zde](#dedukcni-strom)

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
      <td><div class="badge">COMP ANGLE</div> comparison between 2 angles</td>
      <td>(agentA=alfa,</br>agentB=beta,</br>relationship="complementary")</td>
      <td>Alfa je doplňkový úhel k beta.</td>
    </tr>
    <tr>
      <td><div class="badge">COMP DIFF</div> comparison by difference</td>
      <td>(agentMinuend=celkem,</br>agentSubtrahend=Honzík,</br>quantity=7,</br>entity=sešity)</td>
      <td>Rozdíl mezi sešity celkem a Honzíkem je 7 sešitů./td>
    </tr>
    <tr>
      <td><div class="badge">TRANSFER</div> transfer between 2 agents</td>
      <td>(agentSender=Ája,</br>agentReceiver=Honzík,</br>quantity=7,</br>entity=sešity)</td>
      <td>Ája dala 7 sešitů Honzíkovi.</td>
    </tr>
    <tr>
      <td><div class="badge">DELTA</div> delta</td>
      <td>(agent=Ája,</br>quantity=7,</br>entity=sešity)</td>
      <td>Ája změna v čase o 7 sešitů.</td>
    </tr>
    <tr>
      <td><div class="badge">RATIO</div> part to whole comparison</td>
      <td>(whole={agent:třída,entity:žáci},</br> part=chlapci,</br>ratio=1/4)</td>
      <td>Ve třídě je 1/4 chlapců ze všech žáků.</td>
    </tr>
    <tr>
      <td><div class="badge">COMPLEMENT</div> complement part of the whole</td>
      <td></td>
      <td>Pokud je ve třídě je 1/4 chlapců ze všech žáků, tak doplněk znamená, že ve tříde je 3/4 dívek ze všech žáků.</td>
    </tr>
    <tr>
      <td><div class="badge">RATIOS</div> part to part comparison</td>
      <td>(whole={agent:třída,entity:žáci},</br> parts=[chlapci,dívky],</br>ratios=[1,3])</td>
      <td>Poměr chlapců a dívek ve třídě je 1:3 (1 chlapec ku 3 dívkám).</td>
    </tr>
    <tr>
      <td><div class="badge">SCALE</div>scaling number or part to part scaling</td>
      <td></td>
      <td>Zvětšení. Zvětši 2 krát číslo 6 = 12. Dvojnásobné rozšíření poměru 1:3 je 2:6.</td>
    </tr>
    <tr>
      <td><div class="badge">SCALE-INVERT</div>inverse scaling number or part to part scaling</td>
      <td></td>
      <td>Zmenšení. Zmenši 2 krát  číslo 6  = 3. Dvojnásobné zkrácení poměru 2:6 je 1:3.</td>
    </tr>
    <tr>
      <td><div class="badge">RATE</div> rate</td>
      <td>(agent=Ája,</br>quantity=3,</br>entity=Kč,</br>entityBase=rohlík)</td>
      <td>Každý rohlík, který má Ája, stojí 3 Kč.</td>
    </tr>
    <tr>
      <td><div class="badge">QUOTE</div> quote</td>
      <td>(agent=skupina,</br> agent=dvojice,</br>quantity=5)</td>
      <td>Skupina rozdělena na 5 dvojic.</td>
    </tr>
    <tr>
      <td><div class="badge">SUM</div> sum</td>
      <td>(agentWhole=třída,</br>partAgents=[chlapci,dívky],</br>entityWhole=žáků)</td>
      <td>Počet chlapců a dívek dohromady dává počet žáků ve třídě.</td>
    </tr>
    <tr>
      <td><div class="badge">PRODUCT</div> product </td>
      <td>(agentWhole=obsah obdélníku,</br>partAgents=[šířka,délka],</br>entityWhole=cm2)</td>
      <td>Obsah obdelníku je produktem výšky a šířky.</td>
    </tr>
    <tr>
      <td><div class="badge">PROPORTION</div> proportion </td>
      <td>(inverse=true,</br> entities=[počet výrobků, počet pracovníků])</td>
      <td>Nepřímá úměra platí mezi veličinami počet výrobků a počet pracovníků.</td>
    </tr>
    <tr>
      <td><div class="badge">UNIT</div> convert unit </td>
      <td>(unit=kg)</td>
      <td>Převod na kg.</td>
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
<div class="badge badge--large">COMPLEMENT</div>
${partion([
    {value: 30, agent:"chlapci", label:{ hidePercent: true, hideFraction: false} },
    {value: 90, agent:"dívky", label:{ hidePercent: true, hideFraction: false}},
  ],
  {unit:1, showRelativeValues: true, multiple:5 })
}

${partion([
    {value: 1, agent:"chlapci", label:{ hidePercent: true, hideFraction: false} },
    {value: 3, agent:"dívky", label:{ hidePercent: true, hideFraction: false}},
  ],
  {unit:1, showRelativeValues: true, multiple:1 })
}
<div>${renderRules(rules.partToWholeRatio)}</div>


### Porovnávání - poměry část ku časti

<div class="badge badge--large">RATIOS</div>
<div class="badge badge--large">NTH-PART</div>

${partion([
    {value: 30, agent:"chlapci", label:{ hidePercent: true, hideFraction: false} },
    {value: 90, agent:"dívky", label:{ hidePercent: true, hideFraction: false}},
  ],
  {unit:1, showRelativeValues: true, multiple:5 })
}

${partion([
    {value: 1, agent:"chlapci", label:{ hidePercent: true, hideFraction: false}},
    {value: 3, agent:"dívky", label:{ hidePercent: true, hideFraction: false}}, 
  ],
  {unit:1, showRelativeValues: true, multiple:1, formatAsFraction: true, unit: 1 })
}


<div>${renderRules(rules.partToPartRatio)}</div>

### Porovnávání - úhly
<div class="badge badge--large">COMP-ANGLE</div>
<div>${renderRules(rules.angleCompare)}</div>


## Škálování 
<div class="badge badge--large">SCALE</div>
<div class="badge badge--large">SCALE-INVERT</div>

<div>${renderRules(rules.scaling)}</div>

## Posuny
<div class="badge badge--large">SLIDE</div>
<div class="badge badge--large">SLIDE-INVERT</div>

<div>${renderRules(rules.sliding)}</div>

## Stav a změna stavu

<div class="badge badge--large">DELTA</div>
<div class="badge badge--large">TRANSFER</div>

<div class="warning" label="Záleží na pořadí">
   Predikát <div class="badge badge--large">DELTA</div>, <div class="badge badge--large">TRANSFER</div> není komutativní. Záleží na pořadí, které umožňuje representovat čas.
</div>


<div>${renderRules(rules.transfer)}</div>


## Rozdělování

<div class="badge badge--large">RATE</div>
<div class="badge badge--large">QUOTA</div>

<div class="tip" label="Rozlišuj počet skupin a velikost skupiny">
   10 : 2 = 5 může reprezentovat 2 různé věci
   <ul>
    <li>2 díly velikosti 5m - znám počet skupin 2, rozdělení 10m tyče na 2 díly o délce 5m - <div class="badge badge--large">RATE</div></li>
    <li>5 dílů velikosti 2m - znám velikost skupiny 2m, rozdělení 10m tyče po 2m na 5 dílů - <div class="badge badge--large">QUOTA</div></li>
   </ul>
</div>


<div>${renderRules(rules.rate)}</div>


## Spojování
<div class="badge badge--large">SUM</div>
<div class="badge badge--large">PRODUCT</div>
<div class="badge badge--large">PRODUCT-COMBINE</div>

<div>${renderRules(rules.sum)}</div>


## Převod jednotek
<div class="badge badge--large">UNIT</div>
<div>${renderRules(rules.unit)}</div>

## Zaokrouhlování
<div class="badge badge--large">ROUND</div>


## Nejmenší společný násobek
<div class="badge badge--large">LCD</div>
<div>${renderRules(rules.lcd)}</div>

## Největší společný dělitel
<div class="badge badge--large">GCD</div>
<div>${renderRules(rules.gcd)}</div>


## Výrazy
<div class="badge badge--large">EVAL-EXPR</div>
<div>${renderRules(rules.eval)}</div>



## Vzory opakování
<div class="badge badge--large">PATTERN</div>

### Square numbers
<div>${renderRules(rules.squareNumbers)}</div>

### Triangular numbers
<div>${renderRules(rules.triangularNumbers)}</div>

### Rectangular numbers
<div>${renderRules(rules.rectangularNumbers)}</div>


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

<div>${renderEx({example:percentPart({input:percentInput})})}</div>


### Výpočet základu

<div>${renderEx({example:percentBase({input:percentInput})})}</div>


### Výpočet procent

<div>${renderEx({example:percentPercentage({input:percentInput})})}</div>

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

<div>${renderEx({example:proportion({input:propInput})})}</div>

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

<div>${renderEx({example:proportionInverse({input:proportionInverseInput})})}</div>

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

<div>${renderEx({example:proportionCombined({input:proportionCombinedInput})})}</div>

## Porovnávání 

### Porovnávání s absolutním rozdílem

```js
const compPartEqForm = Inputs.form({
  diff: Inputs.range([-50, 50], {step: 1, value:25, label: "O kolik je výrobek A dražší/levnější než výrobek B"}),
  whole: Inputs.range([100, 1000], {step: 1, value:100, label: "celkem (Kč)"}),
});
const compPartEqInput = Generators.input(compPartEqForm);
```

<details>
  <summary>Parametrizace</summary>
  ${compPartEqForm}
</details>

<div>${renderEx({example:examplePartEq({input:compPartEqInput})[0]})}</div>


### Porovnání s relativním rozdílem

```js
const compForm = Inputs.form({  
  second: Inputs.radio(new Map([["A", false],["B", true]]), {label:"Výrobek", value:false }),
  part: Inputs.range([1,100], {step: 1, value:10, label: "Cena výrobku (Kč)"}),
  partRatio: Inputs.range([-0.5, 1], {step: 0.05, value:0.25, label: "O kolik je výrobek A relativně dražší/levnější než výrobek B"}),
  
});
const compInput = Generators.input(compForm);
```

<details>
  <summary>Parametrizace</summary>
  ${compForm}
</details>

<div>${renderEx({example:exampleComparePartToWhole({input:compInput})[0]})}</div>



```js
const compRatioForm = Inputs.form({  
  second: Inputs.radio(new Map([["A", false],["B", true]]), {label:"Výrobek", value:false }),
  part: Inputs.range([1,100], {step: 1, value:10, label: "Výrobek A (Kč)"}),
  partRatio: Inputs.range([-10, 10], {step: 1, value:5, label: "Kolikrát je výrobek A dražší/levnější než výrobek B"}),
});
const compRatioInput = Generators.input(compRatioForm);
```

<details>
  <summary>Parametrizace</summary>
  ${compRatioForm}
</details>


<div>${renderEx({example:exampleComparePartToWhole({input:compRatioInput})[1]})}</div>

### Porovnání s absolutním a relativním rozdílem

```js
const compAbsDiffForm = Inputs.form({
  partRatio: Inputs.range([-1, 1], {step: 0.05, value:0.25, label: "O kolik je výrobek A relativně dražší/levnější než výrobek B"}),
  diff: Inputs.range([-50, 50], {step: 1, value:25, label: "O kolik je výrobek A dražší/levnější než výrobek B"}),
});
const compAbsDiffInput = Generators.input(compAbsDiffForm);
```

<details>
  <summary>Parametrizace</summary>
  ${compAbsDiffForm}
</details>


<div>${renderEx({example:exampleDiffPartToWhole({input:compAbsDiffInput})[0]})}</div>



### Porovnání části k celku


```js
const compDiffForm = Inputs.form({
  partRatio: Inputs.range([0, 2], {step: 0.05, value:0.25, label: "relativní cena výrobku A z celkem"}),
  whole: Inputs.range([1,100], {step: 1, value:10, label: "Celkem (Kč)"}),
});
const compDiffInput = Generators.input(compDiffForm);
```

<details>
  <summary>Parametrizace</summary>
  ${compDiffForm}
</details>


<div>${renderEx({example:examplePartToWhole({input:compDiffInput})[0]})}</div>

### Porovnání více hodnot

```js
const compFormMultiple = Inputs.form({  
  second: Inputs.radio(new Map([["A", false],["B", true]]), {label:"Výrobek", value:false }),
  part: Inputs.range([1,100], {step: 1, value:10, label: "Cena výrobku (Kč)"}),
  partRatio: Inputs.range([-0.5, 1], {step: 0.05, value:0.25, label: "O kolik je výrobek A relativně dražší/levnější než výrobek B"}),  
  partRatio2: Inputs.range([-0.5, 1], {step: 0.05, value:0.25, label: "O kolik je výrobek B relativně dražší/levnější než výrobek C"}),
});
const compInputMultiple = Generators.input(compFormMultiple);
```

<details>
  <summary>Parametrizace</summary>
  ${compFormMultiple}
</details>

#### Porovnání A/B a porovnání B/C

<div>${renderEx({example:exampleCompareMultiple({input:compInputMultiple})[0]})}</div>

#### Porovnání A/B a porovnání C/B

<div>${renderEx({example:exampleCompareMultiple({input:compInputMultiple})[1]})}</div>

#### Porovnání B/A a porovnání B/C

<div>${renderEx({example:exampleCompareMultiple({input:compInputMultiple})[2]})}</div>

#### Porovnání B/A a porovnání C/B

<div>${renderEx({example:exampleCompareMultiple({input:compInputMultiple})[3]})}</div>

<!-- ```js
const compFormTotalMultiple = Inputs.form({  
  second: Inputs.radio(new Map([["A", false],["B", true]]), {label:"Výrobek", value:false }),
  total: Inputs.range([1,100], {step: 1, value:10, label: "Celkem všechny výrobky (Kč)"}),
  partRatio: Inputs.range([-0.5, 1], {step: 0.05, value:0.25, label: "O kolik je výrobek A relativně dražší/levnější než výrobek B"}),  
  partRatio2: Inputs.range([-0.5, 1], {step: 0.05, value:0.25, label: "O kolik je výrobek B relativně dražší/levnější než výrobek C"}),
});
const compInputTotalMultiple = Generators.input(compFormTotalMultiple);
```

<details>
  <summary>Parametrizace</summary>
  ${compFormTotalMultiple}
</details>



#### Porovnání A/B a porovnání B/C

<div>${renderEx({example:exampleCompareTotalMultiple({input:compInputTotalMultiple})[0]})}</div>

#### Porovnání A/B a porovnání C/B

<div>${renderEx({example:exampleCompareTotalMultiple({input:compInputTotalMultiple})[1]})}</div>

#### Porovnání B/A a porovnání B/C

<div>${renderEx({example:exampleCompareTotalMultiple({input:compInputTotalMultiple})[2]})}</div>

#### Porovnání B/A a porovnání C/B

<div>${renderEx({example:exampleCompareTotalMultiple({input:compInputTotalMultiple})[3]})}</div> -->

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

<div>${renderEx({example:rectangleExamples({input:rectangleInput})[0]})}</div>
<div>${renderEx({example:rectangleExamples({input:rectangleInput})[1]})}</div>
<div>${renderEx({example:rectangleExamples({input:rectangleInput})[2]})}</div>

### Válec

```js
const cylinderForm = Inputs.form({
  radius: Inputs.range([1, 50], {step: 1, value:10, label: "poloměr podstavy"}),
  height: Inputs.range([1, 10], {step: 1, value:5, label: "výška"}),
});
const cylinderInput = Generators.input(cylinderForm);
```


<details>
  <summary>Parametrizace</summary>
  ${cylinderForm}
</details>

<div>${renderEx({example:cylinderExamples({input:cylinderInput})[0]})}</div>
<div>${renderEx({example:cylinderExamples({input:cylinderInput})[1]})}</div>
<div>${renderEx({example:cylinderExamples({input:cylinderInput})[2]})}</div>


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

<div>${renderEx({example:prismExamples({input:triangleInput})[0]})}</div>
<div>${renderEx({example:prismExamples({input:triangleInput})[1]})}</div>
<div>${renderEx({example:prismExamples({input:triangleInput})[2]})}</div>


<!-- <div>${renderEx({example:autobus()})}</div> -->

# Jak je to uděláno?

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

## Dedukční strom

Obecný postup vytvoření dedukčního stromu ze zadání úlohy
- zadání úlohy je potřeba převést (text comprehension) na sadu __predikátů__ (formalizované pravdivé tvrzení)
- použít __odvozovací pravidla__ (inference rules) 
  - vstupem - seznam  __predikátů__, resp. __předpokladů__ (premises)
  - výstupem - jeden __predikát__
- výsledek úlohy získáme __průchodem stromu__ do hloubky (post-order), tj. aplikujeme __odvozovací pravidla__ až poté, co známe všechny vstupy (premises)


Konkrétní příklad řešení pro zadání [úlohy](./solution-M9I-2025#7)
<video src="./assets/kytice.mp4" autoplay playsinline muted controls style="width: 100%;"></video>

```typescript
import { comp, compRatio, nthPart, rate, ratios, sum } from "../../components/math.js";
import { axiomInput, deduce, last } from "../../utils/deduce-utils.js";

export function kytice() {
  //agent names and entities
  const kyticeAgent = "kytice";
  const chryzatemaAgent = "chryzantéma";
  const ruzeAgent = "růže";
  const staticAgent = "statice";

  const kusEntity = "kus";
  const entity = "cena";

  //axioms
  const rozdilRuze = axiomInput(comp(ruzeAgent, staticAgent, 2, kusEntity), 1);
  const RtoS = axiomInput(compRatio(ruzeAgent, staticAgent, 5 / 4), 2);
  const CHxS = axiomInput(ratios(kyticeAgent, [chryzatemaAgent, staticAgent], [3, 2]), 3);
  const ruzeRate = axiomInput(rate(chryzatemaAgent, 54, entity, kusEntity), 4)
  const chryzantemaRate = axiomInput(rate(chryzatemaAgent, 40, entity, kusEntity), 5)
  const staticeRate = axiomInput(rate(chryzatemaAgent, 35, entity, kusEntity), 6)

  //deduction
  const statice = deduce(
    rozdilRuze,
    RtoS
  )
  const chryzantem = deduce(
    last(statice),
    CHxS,
    nthPart(chryzatemaAgent)
  )
  const ruze = deduce(
    statice,
    rozdilRuze
  )

  return {
    deductionTree: deduce(
      deduce(ruze, ruzeRate),
      deduce(last(statice), staticeRate),
      deduce(chryzantem, chryzantemaRate),
      sum(kyticeAgent, [ruzeAgent, chryzatemaAgent, staticAgent], entity, entity)
    )
  }
}

```

Další příklady jsou [zde](https://github.com/rsamec/cermat-quiz/tree/master/src/math)


## Reprezentace dedukčního stromu

Ke každé úloze lze zobrazit různé reprezentace dedukčního stromu
- textový strom - **shora dolů** kompaktní textový zápis, kořen představuje konečný výsledek
- dedukční strom - **zdola nahoru** - vizuální strom, který umožňuje zobrazovat i grafické prvky
- textový chat - **plochý seznam kroků řešení úlohy** - každý krok má strukturu otázka, vstupy a vyvozený závěr spolu s numerickým výpočtem
- chat - **grafický chat** - oddělení otázky a numerického výpočtu
- chat dialog - **interaktivní chat** - rozhodovačka po jednotlivých krocích s nutností volby z nabízených možností

<div class="tip" label="Rozhodovačka">    
  Vyzkoušej <b>interaktivní rozhodovačku</b> ve formě chatu po jednotlivých krocích s nutností volby z nabízených možností.
</div>
