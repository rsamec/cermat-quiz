---
title: Výsledky cermat testů řešené pomocí AI
footer: false
pager: true
toc: true
---

```js
import {categories} from './utils/quiz-utils.js';
import {formatSubject, formatShortCode, formatPeriod, formatGrade, formatVersionByCode, parseCode, formatCode } from './utils/quiz-string-utils.js';

const rawData = await FileAttachment(`./data/quiz-results-${observable.params.model}.json`).json();
const quizLangCategories = await FileAttachment("./data/quiz-lang-categories.json").json();
const quizGeneratedCategories = await FileAttachment("./data/quiz-categories.json").json();
const quizCategories = ({
  ...quizLangCategories,
  ...quizGeneratedCategories
})

const data = Object.entries(rawData).map(([code,values]) => ({code,year: parseInt(code.substr(4,4),10),...values}))
const questionsAndCategories = data.filter(d => quizCategories[d.code] != null).flatMap(d => {
  const code = d.code;
  const points = rawData[code].points;
  return quizCategories[code].questions.map(d => ({...d, code, ...parseCode(code), ...points[d.id]}))
})
function naturalSorting(a, b) {
  const aParts = a.split(".").map(Number);
  const bParts = b.split(".").map(Number);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aVal = aParts[i] || 0; // If part is missing, treat it as 0
    const bVal = bParts[i] || 0;

    if (aVal !== bVal) {
      return aVal - bVal; // Compare numerically
    }
  }
  return 0;
}
function columnsFormatter(questionMax = 33, subQuestionMax = 65) {
  return _.range(1, questionMax)
    .flatMap((d) =>
      [`${d}`].concat(_.range(1, subQuestionMax).map((d2) => `${d}.${d2}`))
    )
    .reduce((out, v) => {
      out[v] = (x) =>
        typeof x === "boolean"
          ? htl.html`<div style="padding:2px;text-align:center;background:${
              x ? "lightgreen" : "lightsalmon"
            }">${x ? "OK" : "X"}</div>`
          : x?.v != null && x?.max != null
          ? x.v == x.max
            ? `${x.v}`
            : `${x.v} z ${x.max}`
          : typeof x ==="string" && x.startsWith('http') ? htl.html`<a href=${x} target=_blank>obrázek</a>`: x;

      return out;
    }, {});
}
function uniqueColumns(data){
  return Array.from(new Set(data.flatMap(d => Object.keys(d)))).sort(naturalSorting)
}
function sparkbar(max) {
  return x => htl.html`<div style="
    background: var(--theme-background-alt);
    border: 1px solid var(--theme-foreground-fainter);
    width: ${100 * x / max}%;
    float: right;
    padding-right: 3px;
    box-sizing: border-box;
    overflow: visible;
    display: flex;
    justify-content: end;">${x.toLocaleString("en")}`
}

function pointsSummary({ subject, grade, year}, totalPoints = 50, ) {
  const filteredData = data.filter(
    (d) => d.subject == subject && (grade == null || d.grade == grade) && (year == null || d.year == year)
  );
  return Plot.plot({
    grid: true,
    axis: null,
    label: null,
    width,
    height: 260,
    marginTop: 20,
    marginBottom: 70,
    title: `${formatSubject(subject)} - ${formatPeriod(grade)} ${year != null ? ` ${year}`: ''}`,
    marks: [
      Plot.axisFx({
        lineWidth: 10,
        anchor: "bottom",
        dy: 30,
        fontSize: 20,
        text: (d) => formatVersionByCode(d),
      }),
      Plot.waffleY({ length: 1 }, { y: totalPoints, fillOpacity: 0.4, rx: "100%" }),
      Plot.waffleY(filteredData, {
        fx: "code",
        y: "totalPoints",
        rx: "100%",
        fill: "orange",
        sort: { fx: "y", reverse: true }
      }),
      Plot.text(filteredData, {
        fx: "code",
        text: (d) =>
          (d.totalPoints / d.maxTotalPoints).toLocaleString("en-US", {
            style: "percent"
          }),
        frameAnchor: "bottom",
        lineAnchor: "top",
        dy: 6,
        fill: "orange",
        fontSize: 30,
        fontWeight: "bold"
      })
    ]
  });
}

function pointsToMaxPointsByCategories({ subject }) {
  const data = questionsAndCategories.filter(d => d.subject === subject).map((d) => ({
    ...d,
    tooltip: `${d.v} z ${d.max} - ${d.id}`
  }));
  return Plot.plot({
    
    marginLeft: 150,
    marginBottom: 170,
  
    title:`${formatSubject(subject)} - body / maximální počet bodů dle kategorií`,
    x: { label: null, tickRotate: -40, tickFormat: d => categories[subject][d]},
    y: { label: null, tickFormat: (d) => (d != null ? formatCode(d) : "") },
    r: { range: [0, 12] },
    marks: [
      Plot.dot(
        data,
        Plot.group(
          { r: "sum" },
          { r: "v", x: "category", y: "code", fill: "lightgreen", }
        )
      ),
      Plot.dot(data, {
        ...Plot.group(
          { r: "sum" },
          {
            r: "max",
            x: "category",
            y: "code",
            //stroke: "blue",
            //fill: "transparent",
            title: "tooltip"
          }
        ),
        tip: true,
        stroke: (arr) => {
          return arr.some((d) => d.v != d.max) ? "lightsalmon" : "lightgreen";
        }
      })
      // Plot.tip([`a.`], {
      //   x: "GRAMMATICAL_CATEGORIES",
      //   y: "C9A-2024",
      //   r: 1,
      //   dy: 3,
      //   anchor: "top"
      // })
      // Plot.tip(
      //   olympians,
      //   Plot.pointer({
      //     x: "category",
      //     y: "code",
      //     //filter: (d) => d.i,
      //     title: (d) => [d.max, d.v].join("\n\n")
      //   })
      // )
    ]
  });
}

function totalP() {
  const groupedData = [...d3.rollup(data, v => ({totalPoints:d3.sum(v, d => d.totalPoints), maxTotalPoints: d3.sum(v, d => d.maxTotalPoints)}), d => d.subject)].map(([subject,value]) => ({...value, subject})).sort((f,s) => f.maxTotalPoints - s.maxTotalPoints);
  return Plot.plot({
    grid: true,
    axis: null,
    label: null,
    width,
    height: 260,
    marginTop: 50,
    marginBottom: 70,
    marks: [
      Plot.axisFx({
        lineWidth: 10,
        anchor: "bottom",
        dy: 30,
        fontSize: 16,
        text: (d) => formatSubject(d),
      }),
      Plot.waffleY(groupedData, { y: "maxTotalPoints", fx:"subject", fillOpacity: 0.4, rx: "100%" }),
      Plot.waffleY(groupedData, {
        fx: "subject",
        y: "totalPoints",
        rx: "100%",
        fill: "orange",
        sort: { fx: "y", reverse: true }
      }),
      Plot.text(groupedData, {
        fx: "subject",
        text: (d) =>
          (d.totalPoints / d.maxTotalPoints).toLocaleString("en-US", {
            style: "percent"
          }),
        frameAnchor: "bottom",
        lineAnchor: "top",
        dy: 6,
        fill: "orange",
        fontSize: 30,
        fontWeight: "bold"
      }),
      Plot.text(groupedData, {
        fx: "subject",
        text: (d) => `${d.totalPoints}`,
        frameAnchor: "top",
        lineAnchor: "bottom",
        dy: -25,
        fill: "orange",
        fontSize: 30,
        fontWeight: "bold"
      }),
      Plot.text(groupedData, {
        fx: "subject",
        text: (d) => `(${d.maxTotalPoints})`,
        frameAnchor: "top",
        lineAnchor: "bottom",
        dy: -5,
        fontSize: 16,
        fontWeight: "bold"
      }),
      
    ]
  })
}
```
# Úspěšnost dle předmětů

Procento vyjadřuje **počet bodů z maximálního počtu možných bodů**. Vstupem jsou všechny úlohy z databanky.

${
  totalP(50)
}

# Úspěšnost dle kategorií

<div class="grid grid-cols-1">
  <div class="card">
    ${pointsToMaxPointsByCategories({subject:'cz'})}
  </div>
</div>


<div class="grid grid-cols-1">
  <div class="card">
    ${pointsToMaxPointsByCategories({subject:'math'})}
  </div>
</div>


# Detailní výsledky dle testů 
*Pro zobrazení konkrétních odpovědí zvolte test v tabulce níže.*

```js info
const search = view(Inputs.search(data, {placeholder: "Vyhledej test"}));
```
```js
const selected = view(Inputs.table(search, {
  required: false,
  columns: [
    "code",
    "subject",
    "grade",
    "totalAnswers",
    "totalPoints",
    "maxTotalPoints"
  ],
  sort: "totalPoints",
  reverse: true,
  format: {
    grade: (d) => formatPeriod(d),
    subject: d => formatSubject(d),
    totalPoints: sparkbar(d3.max(data, (d) => d.totalPoints)),
    year: d3.format("d") // format as "1960" rather than "1,960"
  }
}))
```
```js
const answers = selected.flatMap((d) => ({...d.corrections, code: d.code, subject: d.subject, grade: d.grade}));
const selectedResult = view(Inputs.table(answers,{
    columns: uniqueColumns(answers),
    format: columnsFormatter(),
    select: false,
    multiple: false,
  }));

  const tables = [];
  for (let selectedResult of selected) {
    const quiz = rawData[selectedResult.code];
    const data = [
      quiz.points,
      quiz.corrections,
      quiz.answers,
      quiz.correctAnswers,      
    ];
    tables.push(htl.html`<div><div style='font-size:24px;font-weight:bold'>${formatCode(selectedResult.code)}</div>${Inputs.table(data, {
      columns: uniqueColumns(data),
      select: false,
      format: columnsFormatter()
    })}</div>`);
  }
view(html`<div style='display:flex;flex-direction:column;gap:20px'>${tables}<div>`)
```

# Úspěšnost dle jednotlivých testů 
Procento vyjadřuje počet získaných bodů z maximálního počtu možných bodů.

## Čeština

<div class="grid grid-cols-2">
  
  <div class="card">
    ${pointsSummary({subject:'cz', grade:'diploma', year: 2024})}
  </div>
  <div class="card">
    ${pointsSummary({subject:'cz', grade:'diploma', year: 2023})}
  </div>
  <div class="card">
    ${pointsSummary({subject:'cz', grade:'4', year:2024})}
  </div>
  <div class="card">
    ${pointsSummary({subject:'cz', grade:'4', year:2023})}
  </div> 
  <div class="card">
    ${pointsSummary({subject:'cz', grade:'6', year: 2024})}
  </div>
  <div class="card">
    ${pointsSummary({subject:'cz', grade:'6', year: 2023})}
  </div>

  <div class="card">
    ${pointsSummary({subject:'cz', grade:'8', year: 2024})}
  </div>
  <div class="card">
    ${pointsSummary({subject:'cz', grade:'8', year: 2023})}
  </div>
</div>


## Matika

<div class="grid grid-cols-2">
  <div class="card">
    ${pointsSummary({subject:'math', grade:'diploma', year:2023})}
  </div>
  
  <div class="card">
    ${pointsSummary({subject:'math', grade:'4', year:2024})}
  </div>
  
  <div class="card">
    ${pointsSummary({subject:'math', grade:'4', year:2023})}
  </div> 
  
  <div class="card">
    ${pointsSummary({subject:'math', grade:'6', year:2024})}
  </div>
  <div class="card">
    ${pointsSummary({subject:'math', grade:'6', year:2023})}
  </div>

  <div class="card">
    ${pointsSummary({subject:'math', grade:'8', year: 2024})}
  </div>
  <div class="card">
    ${pointsSummary({subject:'math', grade:'8', year: 2023})}
  </div>
</div>


## Angličtina

<div class="grid grid-cols-2" style="grid-auto-rows: auto;">
  <div class="card">
    ${pointsSummary({subject:'en', grade:'diploma', year:2024}, 100)}
  </div>
  <div class="card">
    ${pointsSummary({subject:'en', grade:'diploma', year:2023}, 95)}
  </div>
</div>


## Němčina

<div class="grid grid-cols-2" style="grid-auto-rows: auto;">
  <div class="card">
    ${pointsSummary({subject:'de', grade:'diploma', year:2023}, 100)}
  </div>
</div>


