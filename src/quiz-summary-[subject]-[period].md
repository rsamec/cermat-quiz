---
title: Quiz viewer
theme: ["wide"]
sidebar: true
header: false
footer: false
pager: true
toc: true
style: /assets/css/quiz.css
---

```js
import { quizes, formatShortCode, formatPeriod, formatVersion, parseCode } from './utils/quizes.js';
const filteredQuizes = quizes.filter(d => d.subject === observable.params.subject && d.period === observable.params.period).flatMap(d => d.codes)
const quizesByYear = Object.entries(Object.groupBy(filteredQuizes, (d) => parseCode(d).year));

const pdfs = await FileAttachment(`./data/pdf-${observable.params.subject}-${observable.params.period}.json`).json();

```

<!-- Cards with big numbers -->

<div class="grid grid-cols-2">
 ${quizesByYear.map(([year,codes]) => html`<div class="card">
    <div class="v-stack v-stack--l">
    <div class="v-stack v-stack--s">
      <div>
        <div class="big">${year}</div>
        <span>${codes.length.toLocaleString("en-US")} testy</span>
      </div>
      <div class="h-stack h-stack--m h-stack--wrap">
        ${codes.map(code => {
          const {order, period,year} = parseCode(code);
          return html`<a class="h-stack h-stack--xs" href="./form-${code}">${formatVersion({order,period})}</a>`
        })}
      </div>
    </div>
  </div>`
  )}
</div>

## PDF - balíčky testů

```js
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

<ul>${Object.entries(pdfs).filter(([key]) => parseFileKey(key).pageSize === pageSize && parseFileKey(key).pageOrientation === pageOrientation).map(([key, values]) => html`<li><a href="./assets/pdf/${observable.params.subject}-${observable.params.period}/${key}.pdf"><i class="fa-solid fa-file-pdf"></i> ${key} (${values.reduce((out,[v,n])=> out+=n,0)} stránek)</a></li>`)}</ul>

### Struktura PDF balíčků dle počtu sloupců a stran
```js
const pdfsData = Object.entries(pdfs).flatMap(([key,value]) => value.map(([code,count]) => ({key, code,count})))
const filteredData = pdfsData.filter(d =>  parseFileKey(d.key).pageSize === pageSize && parseFileKey(d.key).pageOrientation === pageOrientation).sort((f,s) => parseCode(s.code).year - parseCode(f.code).year);

display(Plot.plot({
   color: {legend: true, tickFormat: d => formatShortCode(d.substring(0,8))},
   height: 420,
   x:{ label: 'Počet sloupců na stránce' },
   y:{ label:'Počet stran' },
   marks:[
    Plot.waffleY(filteredData, Plot.groupX({y:"sum"}, {x: "key", y:"count", fill:'code', tip: true})),
   ]
   }))
```
