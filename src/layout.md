```js
import * as a from "npm:@appnest/masonry-layout";
```
<h2>
  Náhled testu
</h2>

```js
const columnsInput = Inputs.form({
  layoutPerQuiz: Inputs.toggle({label:"Vykreslovat za jednotlivé testy", value: false}),
  layout: Inputs.radio(
    new Map([["žádné","none"],["Sloupcový","multiColumn"],["Tabulkový po řádcích","row"],["Tabulkový po sloupcích","column"],[ "Masonry", "masonry"]]),
    { label:"Rozvržení stránky", value:"multiColumn" }
  ),  
  aligned:Inputs.toggle({label:"Zarovnat v rámci tabulky", value: true}),

  columnWidth: Inputs.range([10,36], {step:1, value: 24, label: "Šířka sloupce"}),
  avoidBreakInsideQuestion: Inputs.toggle({label:"Nezalamovat v rámci otázky", value: true}),
  avoidBreakInsideQuiz: Inputs.toggle({label:"Nezalamovat v rámci testu"})
});
const columnsSetting = Generators.input(columnsInput);
```

```js
const parameters = ({
  questions: convertQueryParamToQuestions(queryValue),
  subject:observable.params.subject,
  quizQuestionsMap,  
  displayOptions:{...columnsSetting, ...controlsSetting},
  resourcesMap
})

const renderedQuestions = renderedQuestionsPerQuiz(parameters);
const {layout,layoutPerQuiz, aligned, avoidBreakInsideQuiz, columnWidth} = parameters.displayOptions;

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
      ?  html`<div data-testid="root" class=${cls([useColumns && 'use-columns'])} style=${useColumns ? `columns:${columnWidth ?? 24}rem`:''}>${renderedQuestions.map((d,index) => html`<div class=${cls([avoidBreakInsideQuiz && 'break-inside-avoid-column'])}>${d}</div>`)}</div>`
      : layout === 'masonry' && !layoutPerQuiz
        ? html`<div data-testid="root"><masonry-layout>${renderedQuestions.map((d,index) => html.fragment`${d}`)}<masonry-layout></div>`
        : layout === 'masonry' && layoutPerQuiz
          ? html`<div data-testid="root">${renderedQuestions.map((d,index) => html`<masonry-layout>${d}<masonry-layout>`)}</div>`
          : layoutPerQuiz
            ? html`<div data-testid="root">${renderedQuestions.map((d,index) => html`${d}`)}</div>`
            : html`<div data-testid="root">${renderedQuestions.map((d,index) => html.fragment`${d}`)}</div>`;
      
display(renderedContent);

```
