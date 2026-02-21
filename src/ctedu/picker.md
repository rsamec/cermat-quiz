---
title: Výběr testu
sidebar: true,
pager: true
footer: false
toc: false
style: '/assets/css/quiz-picker.css'
---

```js
import { quizes } from '../utils/quiz-utils.js';
import { formatPeriod} from './utils.js'
const ctEduFolders = await FileAttachment("../ctedu/folders.json").json();

```
<!-- Cards with big numbers -->

<div class="grid grid-cols-4">
 ${[2026].map((year) => html`<div class="card">
    <div class="v-stack v-stack--l">
    <div class="v-stack v-stack--s">
      <div>
        <div class="big">${year}</div>
      </div>
      <div class="v-stack v-stack--l">
        ${ctEduFolders.map(period => html`<div class="h-stack h-stack--m h-stack-items--center h-stack--wrap">
              <a class="h-stack h-stack--s" href="./solution-${period}"><i class="fas fa-money-check"></i><span>${formatPeriod(period)}</span></a>
              <a class="h-stack h-stack--s" href="./print-${period}"><i class="fa-solid fa-print"></i><span>tisk</span></a>            
              <a class="h-stack h-stack--s" href="./arch-${period}"><i class="fa-solid fa-key"></i><span>klíč</span></a>
              <button  popovertarget=popover-apps-${period}>Trénuj<i class="fas fa-caret-down"></i></button>
              <div id=popover-apps-${period} class="menu-items" popover>
                <div class="v-stack v-stack--m">
                  <a class="h-stack h-stack--s" href="./form-${period}" title="Vyplnění odpovědí"><i class="fa fa-file-waveform"></i><span>Vyplňovačka</span></a>
                  <a class="h-stack h-stack--s" href="./calculator-${period}" title="Kalkulačka"><i class="fa fa-calculator"></i><span>Kalkulačka</span></a>
                  <a class="h-stack h-stack--s" href="./chat-stepper-${period}" title="Rozhodovačka"><i class="fa fa-diagram-project"></i><span>Rozhodovačka</span></a>
                  <a class="h-stack h-stack--s" href="./color-expression-${period}" title="Obarvovačka"><i class="fa fa-palette"></i><span>Rozpad výpočtu</span></a>
                </div>
              </div>
              <button  popovertarget=popover-data-${period}>Data<i class="fas fa-caret-down"></i></button>
              <div id=popover-data-${period} class="menu-items" popover>
                <div class="v-stack v-stack--m">
                  <a class="h-stack h-stack--s" href="./word-problems-${period}" title="Řešení slovních úloh (markdown)"><i class="fa fa-brands fa-markdown"></i><span>Postupy řešení - markdown</span></a>
                  <a download class="h-stack h-stack--s" href="./data/word-problems-${period}.tldr"  title="Řešení slovních úloh (tldraw)"><i class="fa fa-chart-diagram"></i><span>Postupy řešení - tldraw</span><a>
                </div>
              </div>                        
          <div>`
        )}
      </div>
    </div>
  </div>`
  )}
</div>

## Balíček dat ke stažení

Balíček **všech zadání úloh** ve formátu markdown členěno dle granularity až na úroveň

- <a download class="h-stack h-stack--s  h-stack-items--center" href="/ctedu/questions.zip"><i class="fa fa-brands fa-markdown"></i><span>jednotlivých testů</span></a>
- <a download class="h-stack h-stack--s  h-stack-items--center" href="/ctedu/question.zip"><i class="fa fa-brands fa-markdown"></i><span>jednotlivých úloh</span></a>

Balíček **úloh s postupy řešení** ve formátu markdown členěno dle granularity až na úroveň
- <a download class="h-stack h-stack--s  h-stack-items--center" href="/ctedu/word-problems.zip"><i class="fa fa-brands fa-markdown"></i><span>jednotlivých testů</span></a>
- <a download class="h-stack h-stack--s  h-stack-items--center" href="/ctedu/word-problem.zip"><i class="fa fa-brands fa-markdown"></i><span>jednotlivých úloh</span></a>




## Balíčky PDF pro tisk ke stažení

```js
const pdfs = await FileAttachment(`./pdf.json`).json();
function parseFileKey(value) {
  const parts =  value.split('-');
  return  {
    pageSize:parts[0],
    columnsCount: parts[2],
    pageOrientation: parts.length === 4 ? 'landscape': 'portrait'}
}

const pageSizeInput = Inputs.radio(['A4','A3'], {value: 'A4', label: 'Velikost stránky'});
const pageSize = Generators.input(pageSizeInput);
view(pageSizeInput);

const pageOrientationInput = Inputs.radio(['portrait','landscape'], {value: 'portrait', label:"Orientace", format: d => d == "landscape" ? 'na šířku': 'na výšku'});
const pageOrientation = Generators.input(pageOrientationInput);
view(pageOrientationInput);
```

```js
const pdfsData = Object.entries(pdfs).flatMap(([key,value]) => value.map(([code,count]) => ({key, code,count})))
const filteredData = pdfsData.filter(d =>  parseFileKey(d.key).pageSize === pageSize && parseFileKey(d.key).pageOrientation === pageOrientation);

```

<ul>${Object.entries(pdfs).filter(([key]) => parseFileKey(key).pageSize === pageSize && parseFileKey(key).pageOrientation === pageOrientation).map(([key, values]) => html`<li><a href="/assets/pdf/ctedu/${key}.pdf"><i class="fa-solid fa-file-pdf"></i> ${key} (${values.reduce((out,[v,n])=> out+=n,0)} stránek)</a></li>`)}</ul>

<details>
  <summary>
    Obsah PDF balíčků dle počtu sloupců a stran
  </summary>
  ${Plot.plot({
    color: {legend: true, tickFormat: d => formatPeriod(d)},
    height: 420,
    x:{ label: 'Počet sloupců na stránce' },
    y:{ label:'Počet stran' },
    marks:[
      Plot.waffleY(filteredData, Plot.groupX({y:"sum"}, {x: "key", y:"count", fill:'code', tip: true})),
    ]
   })}
</details>
