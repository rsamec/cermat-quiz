---
theme: dashboard
title: Kategorie úloh
footer: false
pager: false
toc: false
---

# Kategorie úloh 🚀

<!-- Load and transform the data -->

```js
import {convertTree, formatSubject, formatPeriod, parseCode, formatCode, categories} from './utils/quiz-utils.js';

const quizLangCategories = await FileAttachment("./data/quiz-lang-categories.json").json();
const quizGeneratedCategories = await FileAttachment("./data/quiz-categories.json").json();
const quizCategories = ({
  ...quizLangCategories,
  ...quizGeneratedCategories
})

const quizQuestions = Object.entries(quizCategories).flatMap(([code, value]) =>
  value.questions.map((d) => {
    const parsedCode = parseCode(code);
    return {
      ...d,
      code,      
      period: parsedCode.period,      
      subject: parsedCode.subject,
      year: parsedCode.year,
      Category: categories[parsedCode.subject][d.category],
    };
  })
)

const subjects = ["math","cz","en","de"];
```

<!-- A shared color scale for consistency, sorted by the number of launches -->

```js
const color = Plot.scale({
  color: {
    type: "categorical",
    domain: d3.groupSort(quizQuestions, (D) => -D.length, (d) => d.year).filter((d) => d !== "Other"),
    unknown: "var(--theme-foreground-muted)"
  }
});
```

<!-- Cards with big numbers -->

<div class="grid grid-cols-4">
 ${subjects.map(subject => html`<div class="card">
    <h2>${formatSubject(subject)}</h2>
    <span class="big">${quizQuestions.filter((d) => d.subject === subject).length.toLocaleString("en-US")}</span>
  </div>`)}
</div>

<!-- Plot of questions per category -->

```js
function plotQuestionsByCategory(data, {width, height, title} = {}) {
  return Plot.plot({
    title,
    width,
    fy: {
      label: null,
      grid: false,
      tickFormat: d => formatPeriod(d),
    },
    height,
    marginLeft:300,
    y: {grid: true, label: "Kategorie"},
    x: {grid: false, label: "Počet úloh"},
    color: {...color, legend: true},
    marks: [
      Plot.rectX(data, Plot.groupY({x: "count"}, {y: "Category", fill: "year", tip: true, fy: "period", sort: {y: "-x"}})),
      Plot.ruleY([0])
    ]
  });
}
```

```js
function groupByPeriodCount(data){
  const groups = Object.groupBy(data, ({period}) => period);
  return Object.keys(groups).length;
}
```
<div>
${subjects.map(subject => html`<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => plotQuestionsByCategory(quizQuestions.filter((d) => d.subject === subject), {
      title: `${formatSubject(subject)} - úlohy dle kategorií`,
      width,
      height: 300 * groupByPeriodCount(quizQuestions.filter((d) => d.subject === subject))
    }))}
  </div>
</div>`)}
</div>
