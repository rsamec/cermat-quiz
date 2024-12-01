---
title: Rozvržení stránky
theme: ["wide"]
sidebar: true
pager: true
footer: false
toc: false
style: /assets/css/quiz.css
---

```js
import * as a from "npm:@appnest/masonry-layout";
import {cls, convertQueryParamToQuestions} from "./utils/string-utils.js";
import {renderedQuestionsPerQuiz} from './components/quiz-form.js';
import invert from 'invert-color';
const quizQuestionsMap = await FileAttachment(`./data/quiz-math-4.json`).json();
import { debounce } from './utils/debounce.js';

```
<h2>
  Náhled testu
</h2>

```js
const controlsInput = Inputs.form({
  useFormControl:Inputs.toggle({ label: "Formulář", value:true}),
  useResources:Inputs.toggle({ label: "Řešení", value:false}),
  useAIHelpers:Inputs.toggle({ label: "AI", value: false}),
})
const controlsSetting = Generators.input(controlsInput);

const columnsInput = Inputs.form({
  layout: Inputs.radio(["column","row","masonry", "multiColumn", "multiColumnPerQuiz"],{ value:'column'}),
  layoutPerQuiz: Inputs.toggle({label:"Vykreslovat za jednotlivé testy", value: false}),
  useColumns: Inputs.toggle({value:true, label:"Použít sloupce"}),
  columnWidth: Inputs.range([10,36], {step:1, value: 24, label: "Šířka sloupce"}),
  avoidBreakInsideQuestion: Inputs.toggle({label:"Nezalamovat v rámci otázky", value: true}),
  avoidBreakInsideQuiz: Inputs.toggle({label:"Nezalamovat v rámci testu"}),
  useCode: Inputs.toggle({label:"Zobrazovat názvy testů", value: true}),
  aligned: Inputs.toggle({label:"Zarovnat", value: false}),
  gap: Inputs.range([0,30], {label:'Mezera', value: 10, step:1})
});
const columnsSetting = Generators.input(columnsInput);
```

```js
const color = d3.scaleOrdinal([1,2,3,4,5,6,7,8,9,10], d3.schemeTableau10);


const styles = [...Array(65).keys()].map((d,i) =>  `.qa-${d} { background-color:${color(d)}; color:${invert(color(d), { black: '#3a3a3a', white: '#fafafa' })}; }`).join("\n");
display(html`<style>.q { padding: 16px; border: 1px solid var(--theme-foreground); border-radius:16px;box-sizing: border-box;} ${styles}</style>`)
```

<div>
  <details>
    <summary>
      Možnosti zobrazení
    </summary>
    <section>
    <div class="grid grid-cols-2">
        ${columnsInput}
        ${controlsInput}
      </div>
  </section>
  </details>
</div> 

```js
const subject = "math"
const queryValue = `M9A-2024,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16|M9B-2024,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16|M9C-2024,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16|M9D-2024,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16|M9A-2023,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16|M9B-2023,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16|M9C-2023,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16|M9D-2023,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16&layoutPerQuiz=false&useColumns=true&columnWidth=24&avoidBreakInsideQuestion=true&avoidBreakInsideQuiz=false&useCode=true&useFormControl=true&useResources=false&useAIHelpers=false`;

const parameters = ({
  questions: convertQueryParamToQuestions(queryValue),
  subject,
  quizQuestionsMap,  
  displayOptions:{...columnsSetting, ...controlsSetting},
})

const renderedQuestions = renderedQuestionsPerQuiz(parameters);
const {layout, gap, layoutPerQuiz, aligned, avoidBreakInsideQuiz, columnWidth} = parameters.displayOptions;


const maxQuestions = Math.max(...parameters.questions.map(d => d.length)) - 1;
const useColumns = layout === 'multiColumnPerQuiz' || layout === 'multiColumn';
const renderedContent = layout === 'column' && layoutPerQuiz
  ? html`<div data-testid="root" class="grid-column">${renderedQuestions.map((d,index) => html`<div class=${cls(['grid-column-child', aligned && 'grid-column-child--subgrid'])} style=${`grid-row: span ${maxQuestions}`}>${d}</div>`)}</div>`
  : layout === 'column' && !layoutPerQuiz
  ? html`<div data-testid="root" class="grid-column-auto">${renderedQuestions.map((d,index) => html.fragment`${d}`)}</div>`
  : layout === 'row' && layoutPerQuiz
    ? html`<div data-testid="root" class="grid-row">${renderedQuestions.map((d,index) => html`<div class=${cls(['grid-row-child', aligned && 'grid-row-child--subgrid'])} style=${`grid-column: span ${maxQuestions}`}>${d}</div>`)}</div>`
    : layout === 'row' && !layoutPerQuiz
    ? html`<div data-testid="root" class="grid-row-auto">${renderedQuestions.map((d,index) => html.fragment`${d}`)}</div>`
    : layout === 'multiColumn' && layoutPerQuiz
      ? html`<div data-testid="root">${renderedQuestions.map((d,index) => html`<div class=${cls([(layout ==='multiColumnPerQuiz' && index > 0) && 'break-before-page', useColumns && 'use-columns'])} style=${useColumns ? `columns:${columnWidth ?? 24}rem`:''}>${d}</div>`)}</div>`
      : layout === 'multiColumn' && !layoutPerQuiz
      ?  html`<div data-testid="root" class=${cls([useColumns && 'use-columns'])} style=${useColumns ? `columns:${columnWidth ?? 24}rem`:''}>
      ${renderedQuestions.map((d,index) => html`<div class=${cls([avoidBreakInsideQuiz && 'break-inside-avoid-column'])}>${d}</div>`)}</div>`
      : layout === 'masonry' && !layoutPerQuiz
        ? html`<div data-testid="root"><masonry-layout gap=${gap}>${renderedQuestions.map((d,index) => html.fragment`${d}`)}<masonry-layout></div>`
        : layout === 'masonry' && layoutPerQuiz
          ? html`<div data-testid="root">${renderedQuestions.map((d,index) => html`<masonry-layout gap=${gap}>${d}<masonry-layout>`)}</div>`
          : layoutPerQuiz
            ? html`<div data-testid="root">${renderedQuestions.map((d,index) => html`${d}`)}</div>`
            : html`<div data-testid="root">${renderedQuestions.map((d,index) => html.fragment`${d}`)}</div>`;
      
display(renderedContent);

```
