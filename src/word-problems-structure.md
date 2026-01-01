---
title: Struktura řešení slovních úloh
footer: false
pager: true
toc: true
---

## Četnosti použití predikátů v krocích řešení úloh
Popisuje strukturu použití predikátů v jednotlivých krocích řešení úloh.

```js
const metricsRulesData = await FileAttachment("./data/word-problems-metrics-rules.json").json();
const sets = extractSets(metricsRulesData);
const combinations = generateCombinations(sets, {type:'intersection', order: 'cardinality:desc', min: 2})


const selection = view(UpSetJSElement(sets, combinations, {height: 1000, theme: mode, mode:'click'}))
```


```js
display(renderPrintLink(selection))
display(renderLinks(selection))
```

## Čestnosti použití pravidel v řešení úloh

Popisuje strukturu úlohy, resp. použití pravidel při řešení jednotlivých úloh.


```js
const stepsMmetricsData = await FileAttachment("./data/word-problems-metrics-steps.json").json();
const stepsSets = extractSets(stepsMmetricsData);
const stepsCombinations = generateCombinations(stepsSets, {type:'distinctIntersection', order: 'cardinality:desc', min: 2})


const stepsSelection = view(UpSetJSElement(stepsSets, stepsCombinations, {height: 1600, theme: mode, mode:'click'}))
```

```js
display(renderPrintLink(stepsSelection))
display(renderLinks(stepsSelection))
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
  return html`<ul>${(selection?.elems ?? []).map(d => html`<li><a href=./word-problem-${d.code}-n-${d.question}#${d.key} target="_blank">${formatShortCodeAlt(d.code)} - ${d.key}${d.index != null ? ` (krok č.${d.index + 1})`:''}</a></li>`)}</ul>`
}

function renderPrintLink(selection) {
   if ((selection?.elems ?? []).length === 0) return html`<div class="tip" label="Výběr úloh">Klikněte v grafu, a vytiskněte si úlohy k procvičování.</div>`
   return html`<div class="tip" label="Výběr úloh"><a href=quiz-math?q=${Object.entries(Object.groupBy(selection?.elems ?? [], d => d.code)).map(([code,values]) => `${code},${values.map(d => d.question).filter(unique).join()}`).join("|")}&useFormControl=true&useCode=true target="_blank">Vyplňovačka</a>, <a href=quiz-print-math?q=${Object.entries(Object.groupBy(selection?.elems ?? [], d => d.code)).map(([code,values]) => `${code},${values.map(d => d.question).filter(unique).join()}`).join("|")} target="_blank">Tisk</a></div>`
}

```