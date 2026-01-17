---
title: Struktura řešení slovních úloh
footer: false
pager: true
toc: true
---

<div class="caution" label="Work in Progress">
  Klasifikace predikátu a pravidel do jednotlivých kategorií není dokončena. Jde o první nástřel kategorizace.
</div>

# Členění dle odvozovacích pravidel

Každé **pravidlo** použité ve slovní úloze je klasifikováno do kategorií rozdělených na tyto vrstvy:

- **Kognitivní** vrstva: Strategie (Proč?)
- **Funkční** vrstva: Matematika (Jak?)
- **Doménová** vrstva: Kontext (Kde/O čem?) - členěno dle matematické domény
   - základní členění
   - dle příbuznosti pravidel

Graficky jsou zobrazeny **počty úloh** jednotlivých **kombinací skupin pravidel** ze všech řešených úloh.


## Kognitivní strategie ("Proč")
Jakého logického kroku se snažíme dosáhnout?

Tato vrstva určuje záměr a logický směr uvažování. Odpovídá na otázku: **„Jaký myšlenkový proces právě teď probíhá?“**

|Název|Sémantický popis (Význam strategie)|
|---|---|
|Úsudek / Inference| Vyvození nového vztahu nebo pravdy z existujících informací.|
|Skládání / Kompozice|Sestavování celku nebo vyššího konceptu z jednotlivých prvků.|
|Rozklad / Dekompozice|"Rozbití komplexního problému nebo hodnoty na menší, srozumitelné části."|
|Omezení / Restrikce|"Aplikace pevných pravidel, která omezují prostor možných řešení."|
|Převod / Konverze|Změna reprezentace nebo měřítka při zachování podstaty entity.|
|Normalizace|"Zjednodušení na základní, porovnatelný nebo standardní tvar."|
|Řetězení kroků|"Logické propojování operací do sekvence, kde výstup jedné je vstupem další."|
|Inverze / Obrácení|Myšlenkový postup pozpátku od výsledku k neznámému vstupu.|
|Zachování / Invarianta|"Sledování vlastností, které se v průběhu transformací nemění (např. celkový součet)."|
|Výběr / Selekce|Rozhodování mezi více dostupnými cestami nebo vyhodnocení nejlepší možnosti.|
|Meta-usuzování|"Plánování postupu, abstrakce problému a dohled nad celkovým cílem."|


```js
const congnitiveMetricsData = await FileAttachment("./data/word-problems-metrics-cognitive.json").json();
const congnitiveSets = extractSets(congnitiveMetricsData);
const congnitiveCombinations = generateCombinations(congnitiveSets, {type:'distinctIntersection', order: 'cardinality:desc', min: 1})


const congnitiveSelection = view(UpSetJSElement(congnitiveSets, congnitiveCombinations, {height: 1600, theme: mode, mode:'click'}))
```

```js
display(renderLinks(congnitiveSelection))
```

## Funkční provedení ("Jak")

Tyta vrstva je „dělníkem“ systému. Je to konkrétní mechanika, která vykonává příkazy kognitivní vrstvy. Odpovídá na otázku: **"Jaký konkrétní matematický nástroj nebo operace tento krok provádí?"**

|Název|Sémantický popis (Význam provedení)|
|---|---|
|Aritmetika|"Základní operace (+, -, *, /) včetně lineárního řešení úměr a rovnic."|
|Vyšší matematika|"Nelineární operace jako jsou mocniny, odmocniny nebo logaritmy."|
|Logika a porovnání|"Vyhodnocování podmínek, rovností a nerovností (booleovská logika)."|
|Mapování a projekce|"Strukturální změny, prohazování prvků nebo přenášení hodnot mezi systémy."|
|Redukce a krácení|Snižování složitosti dat (např. krácení zlomků nebo hledání dělitelů).|
|Iterace a cykly|Opakování výpočtu pro řadu prvků nebo procházení posloupností.|
|Heuristika a odhad|"Přibližné výpočty, intuitivní výběry a „měkká“ logika založená na zkušenosti."|

```js
const functionMetricsData = await FileAttachment("./data/word-problems-metrics-functional.json").json();
const functionSets = extractSets(functionMetricsData);
const functionCombinations = generateCombinations(functionSets, {type:'distinctIntersection', order: 'cardinality:desc', min: 2})


const functionSelection = view(UpSetJSElement(functionSets, functionCombinations, {height: 1600, theme: mode, mode:'click'}))
```

```js
display(renderLinks(functionSelection))
```


## Doménový kontext ("Co", "Kde", "O čem")

Tato vrstva zasazuje problém do konkrétní oblasti matematiky a nabízí odpověď na otázku: **„V jakém světě se právě pohybujeme?“** nebo **„O jaké téma jde?“**

|Název|Sémantický popis (O čem je tento matematický svět)|
|---|---|
|Kvantity a hodnoty|Práce s čistými čísly a jejich sémantickou existencí v úloze.|
|Porovnávání|Zkoumání vztahů „o kolik“ nebo „kolikrát“ mezi dvěma objekty.|
|Poměry a úměry|Logika relativní velikosti a přímé/nepřímé závislosti veličin.|
|Vztahy část–celek|"Rozebírání struktury objektu (zlomky, procenta, doplňky)."|
|Distribuce a rozdělování|"Alokace zdrojů (peněz, času, kusů) mezi různé subjekty."|
|Dynamika a změny|"Sledování vývoje hodnoty v čase (přírůstky, úbytky, transformace)."|
|Agregace a seskupování|"Slučování prvků do celků, míchání směsí a sčítání položek."|
|Škálování a transformace|Změna velikosti při zachování vnitřních proporcí (měřítka map).|
|Jednotky a měření|"Interpretace čísel ve fyzikálním světě (metry, kilogramy, sekundy)."|
|Teorie čísel|"Vlastnosti celých čísel (dělitelnost, prvočísla, NSN, NSD)."|
|Algebra a výrazy|"Práce s proměnnými, úpravy výrazů a řešení formálních rovnic."|
|Geometrie|"Prostorové vztahy, tvary, úhly a metrické vlastnosti v prostoru."|
|Posloupnosti a vzory|"Hledání řádu, pravidelnosti a předpovídání dalších prvků v řadě."|
|Evaluation & Meta-reasoning|Hodnocení správnosti postupu a ověřování logických podmínek.|
|Heuristiky a rozum|Kontrola reálnosti výsledku pomocí zkušeností z běžného života.|

```js
const domainMetricsData = await FileAttachment("./data/word-problems-metrics-domain.json").json();
const domainSets = extractSets(domainMetricsData);
const domainCombinations = generateCombinations(domainSets, {type:'distinctIntersection', order: 'cardinality:desc', min: 2})


const domainSelection = view(UpSetJSElement(domainSets, domainCombinations, {height: 1600, theme: mode, mode:'click'}))
```

```js
display(renderLinks(domainSelection))
```

## Doménový kontext ("Co", "Kde", "O čem") - alternativní členění


```js
const rulesMetricsData = await FileAttachment("./data/word-problems-metrics-rules.json").json();
const rulesSets = extractSets(rulesMetricsData);
const rulesCombinations = generateCombinations(rulesSets, {type:'distinctIntersection', order: 'cardinality:desc', min: 2})


const rulesSelection = view(UpSetJSElement(rulesSets, rulesCombinations, {height: 1600, theme: mode, mode:'click'}))
```

```js
display(renderLinks(rulesSelection))
```


# Členění dle predikátů

Každý **predikát** ve slovní úloze je klasifikován do kategorií.

Graficky jsou zobrazeny **počty kroků úloh** jednotlivých **kombinací skupin predikátů** ze všech řešených úloh.

```js
const metricsRulesData = await FileAttachment("./data/word-problems-metrics-predicates.json").json();
const sets = extractSets(metricsRulesData);
const combinations = generateCombinations(sets, {type:'distinctIntersection', order: 'cardinality:desc', min: 2})

const selection = view(UpSetJSElement(sets, combinations, {height: 1000, theme: mode, mode:'click'}))
```

```js
display(renderLinks(selection))
```

```js
import { extractSets, generateCombinations,renderVennDiagram, render as renderUpSetJS} from 'npm:@upsetjs/bundle';
import { formatShortCodeAlt,formatCode, parseCode} from './utils/quiz-string-utils.js';
import { unique } from './utils/common-utils.js';

const mode = Generators.observe(notify => {
  const query = matchMedia("(prefers-color-scheme: dark)");
  const changed = () => notify(query.matches ? "dark" : "light");
  changed();
  query.addListener(changed);
  return () => query.removeListener(changed);
})
function renderVenn(sets, combinations){
  const root = html`<div></div>`;
  renderVennDiagram(root,{sets, combinations, height: 500, width})
  return root
}

function UpSetJSElement(sets, combinations = undefined, extras = {}) {
  const props = {
    sets,
    height: 500,
    width,
    selection: null,
  
    ...extras
  };
  if (combinations) {
    props.combinations = combinations;
  }
  const root = html`<div></div>`;

  const render = () => {
    renderUpSetJS(root, props);
  };
  const handler = set => {
    props.selection = set;
    render();
    root.dispatchEvent(new CustomEvent('input'));
  };
  if (!extras.mode || extras.mode === 'hover') {
    props.onHover = handler;
  } else {
    props.onClick = handler;
  }

  render();

  // fulfill value contract
  Object.defineProperty(root, 'value', {
    get: () => props.selection,
    set: value => {
      props.selection = value || null;
      render();
      root.dispatchEvent(new CustomEvent('input'));
    }
  });

  return root;
}

function renderLinks(selection){

   if ((selection?.elems ?? []).length === 0) return html`<div class="tip" label="Výběr úloh">Klikněte v grafu, a vytiskněte si úlohy k procvičování.</div>`
   return html`<div class="tip" label="Výběr úloh"><a href=quiz-math?q=${Object.entries(Object.groupBy(selection?.elems ?? [], d => d.code)).map(([code,values]) => `${code},${values.map(d => d.question).filter(unique).join()}`).join("|")}&useFormControl=true&useCode=true target="_blank">Vyplňovačka</a>, <a href=quiz-print-math?q=${Object.entries(Object.groupBy(selection?.elems ?? [], d => d.code)).map(([code,values]) => `${code},${values.map(d => d.question).filter(unique).join()}`).join("|")} target="_blank">Tisk</a></div>
   <div><ul>${(selection?.elems ?? []).map(d => html`<li><a href=./word-problem-${d.code}-n-${d.question}#${d.key} target="_blank">${formatShortCodeAlt(d.code)} - ${d.key}${d.index != null ? ` (krok č.${d.index + 1})`:''}</a></li>`)}</ul></div>`
}

```