---
title: Výběr testu
sidebar: true,
pager: true
footer: false
toc: false
---

```js
import { formatShortCode, formatSubject, formatPeriod, formatVersion, parseCode } from './utils/quiz-string-utils.js';
import { quizes } from './utils/quiz-utils.js';
const filteredQuizes = quizes.filter(d => d.subject === observable.params.subject && d.period === observable.params.period).flatMap(d => d.codes)
const quizesByYear = Object.entries(Object.groupBy(filteredQuizes, (d) => parseCode(d).year));

const pdfs = await FileAttachment(`./data/pdf-${observable.params.subject}-${observable.params.period}.json`).json();
const audios = ['M5A-2023', 'M7A-2023', 'M7A-2024', 'M9A-2024', 'M9I-2025']
```

<!-- Cards with big numbers -->

<div class="grid grid-cols-4">
 ${quizesByYear.map(([year,codes]) => html`<div class="card">
    <div class="v-stack v-stack--l">
    <div class="v-stack v-stack--s">
      <div>
        <div class="big">${year}</div>
        <!-- <span>${codes.length.toLocaleString("en-US")} testy</span> -->
      </div>
      <div class="v-stack v-stack--l">
        ${codes.map(code => {
          const {order,subject,period,year} = parseCode(code);
          return html`<div class="h-stack h-stack--m h-stack--wrap">
              <a class="h-stack h-stack--xs" href="./form-${code}"><span>${formatVersion({order,period})}</span><span>↗︎</span></a>
              <a class="h-stack h-stack--xs" href="./print-${code}"><span>tisk</span><i class="fa-solid fa-print"></i></a>
              ${subject === "math" ? html`<a class="h-stack h-stack--xs" href="./solu-${code}"><span>rozbor</span><i class="fa-solid fa-mug-hot"></i></a>`:''}
              ${subject === "math" ? html`<a class="h-stack h-stack--xs" href="./ai-${code}"><span>AI</span><i class="fa-solid fa-comment-nodes"></i></a>`:''}
              ${subject === "math" && audios.indexOf(code) != -1? html`<a class="h-stack h-stack--xs" href="/assets/math/${code}.mp3"><span>podcast</span><i class="fa-solid fa-microphone"></i></a>`:''}
          <div>`
        })}
      </div>
    </div>
  </div>`
  )}
</div>

## Balíčky testů pro tisk ke stažení - PDF

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

```js
const pdfsData = Object.entries(pdfs).flatMap(([key,value]) => value.map(([code,count]) => ({key, code,count})))
const filteredData = pdfsData.filter(d =>  parseFileKey(d.key).pageSize === pageSize && parseFileKey(d.key).pageOrientation === pageOrientation).sort((f,s) => parseCode(s.code).year - parseCode(f.code).year);

```

<ul>${Object.entries(pdfs).filter(([key]) => parseFileKey(key).pageSize === pageSize && parseFileKey(key).pageOrientation === pageOrientation).map(([key, values]) => html`<li><a href="./assets/pdf/${observable.params.subject}-${observable.params.period}/${key}.pdf"><i class="fa-solid fa-file-pdf"></i> ${key} (${values.reduce((out,[v,n])=> out+=n,0)} stránek)</a></li>`)}</ul>

<details>
  <summary>
    Obsah PDF balíčků dle počtu sloupců a stran
  </summary>
  ${Plot.plot({
    color: {legend: true, tickFormat: d => formatShortCode(d.substring(0,8))},
    height: 420,
    x:{ label: 'Počet sloupců na stránce' },
    y:{ label:'Počet stran' },
    marks:[
      Plot.waffleY(filteredData, Plot.groupX({y:"sum"}, {x: "key", y:"count", fill:'code', tip: true})),
    ]
   })}
</details>


