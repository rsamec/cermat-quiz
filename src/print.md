---
title: Tisk
footer: false
pager: true
toc: true
---

## Balíčky pdf

```js
import {formatSubject, formatPeriod} from './utils/quizes.js';
const pdfs = await FileAttachment(`./data/pdf.json`).json();

function formatSubjectAndPeriod (value) {
  const [subject,period] = value.split('-')
  return `${formatSubject(subject)} ${formatPeriod(period)}`
}

const unique = (arr, key) => {
   const keys = new Set();
   return arr.filter(el => !keys.has(el[key]) && keys.add(el[key]));
 };

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
const filteredData = pdfs.filter(d =>  parseFileKey(d.file).pageSize === pageSize && parseFileKey(d.file).pageOrientation === pageOrientation); //.sort((f,s) => parseCode(s.code).year - parseCode(f.code).year);

const groupedByDirectories = Object.entries(Object.groupBy(filteredData, ({directory}) => directory))
```

 ${Plot.plot({
    color: {legend: true, tickFormat: d => formatSubjectAndPeriod(d)},
    height: 420,
    x:{ label: 'Počet sloupců na stránce' },
    y:{ label:'Počet stran' },
    marks:[
      Plot.waffleY(filteredData, Plot.groupX({y:"sum"}, {x: "file", y:"count", fill:'directory', tip: true})),
    ]
   })}


${groupedByDirectories.map(([directory,values]) => html`<h3>${formatSubjectAndPeriod(directory)}</h3> <ul>${unique(values, 'file').map(({file, values}) => html`<li><a href="./assets/pdf/${directory}/${file}.pdf"><i class="fa-solid fa-file-pdf"></i> ${file} (${values.reduce((out,[v,n])=> out+=n,0)} stránek)</a></li>`)}</ul>`)}
