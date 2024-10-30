---
title: Úlohy
theme: ["wide"]
sidebar: true
header: false
footer: false
pager: false
toc: false
style: /assets/css/quiz.css
---

```js
import tippy from 'tippy.js';
import * as a from "npm:@appnest/masonry-layout";
import {categories, parseCode, formatCode, formatSubject, formatPeriod} from './utils/quiz-utils.js';
import {convertQueryParamToQuestions, convertFlagsToQueryParam, convertQuestionToQueryParam, cls} from './utils/string-utils.js';
const quizQuestionsMap = await FileAttachment(`./data/quiz-${observable.params.subject}-${observable.params.period}.json`).json();
const resourcesMap = await FileAttachment(`./data/quiz-answers-detail-gpt-4o.json`).json();
```


<div class="h-stack">
  <h2 style="flex:1;">
    ${formatSubject(observable.params.subject)} - ${formatPeriod(observable.params.period)}
  </h2>
    <div class="h-stack h-stack--s">
      ${actionsButton}      
    </div>
</div>

```js
const quizLangCategories = await FileAttachment("./data/quiz-lang-categories.json").json();
const quizGeneratedCategories = await FileAttachment("./data/quiz-categories.json").json();
const quizCategories = ({
  ...quizLangCategories,
  ...quizGeneratedCategories
})

const filteredQuizCategories = Object.entries(quizCategories).flatMap(([code, value]) => {
  const questions = quizQuestionsMap[code]?.q ?? [];
  return value.questions.map((d,i) => {
      const parsedCode = parseCode(code);
      return {
        ...d,
        code,
        title: questions[i],
        year: parsedCode.year,      
        period: parsedCode.period,      
        subject: parsedCode.subject,
        Category: categories[parsedCode.subject][d.category],
      };
    })
  }
).filter(d => d.subject === observable.params.subject && d.period === observable.params.period)

const years = Object.keys(Object.groupBy(filteredQuizCategories, ({year}) => year));
const selectedYearsInput = Inputs.select(years,{ multiple:true, label:"Rok"});
const selectedYears = Generators.input(selectedYearsInput);

const codes = Object.keys(Object.groupBy(filteredQuizCategories, ({code}) => code));
const selectedCodesInput = Inputs.select(codes,{ multiple:true, format: d => formatCode(d), label:"Test" });
const selectedCodes = Generators.input(selectedCodesInput);

const uniqueCategories = Object.keys(Object.groupBy(filteredQuizCategories, ({Category}) => Category));
const selectedCategoriesInput = Inputs.select(uniqueCategories,{ multiple:true, label:"Kategorie"});
const selectedCategories = Generators.input(selectedCategoriesInput);

```
<div class="card">
  <details>
    <summary>
    Filtry
    </summary>
  <section>
    <div class="grid grid-cols-3">
      <div>
        ${selectedYearsInput}
      </div>
      <div>
        ${selectedCodesInput}
      </div>
      <div>
        ${selectedCategoriesInput}
      </div>
    </div>
  </section>
  </details>
</div>

```js
let filtered = filteredQuizCategories;
if (selectedYears.length > 0){
  filtered = filtered.filter(d=> selectedYears.some(year => d.year === year));
}
if (selectedCodes.length > 0){
  filtered = filtered.filter(d=> selectedCodes.some(code => d.code === code));
}
if (selectedCategories.length > 0){
  filtered = filtered.filter(d=> selectedCategories.some(category => d.Category === category));
}

const search = view(Inputs.search(filtered));

```
```js
const selectedQuestions = view(Inputs.table(search, {
   columns: [
    "id",
    "title",
    "Category",
    "code",
    "year",    
  ],
  format: {
    code: d => formatCode(d)
  }
}));

```

```js
const queryValue = convertQuestionToQueryParam(selectedQuestions);


```

```js
const controlsInput = Inputs.form({
  useAIHelpers:Inputs.toggle({ label: "Pomocná tlačítka", value: true}),
  useFormControl:Inputs.toggle({ label: "Zobrazit možnost online vyplnění", value: true}),
  useExplanationResources:Inputs.toggle({ label: "Zobrazit způsoby řešení", value: true}),
  useCode: Inputs.toggle({label:"Zobrazovat názvy testů", value: true}),
})
const controlsSetting = Generators.input(controlsInput);

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

<div class="card">
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
import {renderedQuestionsPerQuiz} from './components/quiz-form.js';
```

```js
const actionsButton =Inputs.button(["Otevřít","Tisk"].map(d => [d, () => window.open(`./${getExportUrlPart(d ==="Tisk")}`)]))

const getExportUrlPart = (usePrint) => `quiz-${observable.params.subject}-${observable.params.period}?q=${queryValue}&${convertFlagsToQueryParam(usePrint? {...columnsSetting}: {...columnsSetting, ...controlsSetting})}`
const getExportUrl = (usePrint) => `${window.location.origin}/${getExportUrlPart(usePrint)}`

const exportButton =  html`<span>
  ${toolTipper(
    html`<button>Export</button>`,
    () => html`<div class="v-stack v-stack--m" style="padding:10px">
      <div class="v-stack">
        <span class="small">Vlož tento HTML tag do libovolné stránky.</span>
        <pre style="height:60px">
          <code>
            <span>${`<iframe width="100%" height="1359" frameborder="0" src="${getExportUrl(true)}"></iframe>`}</span>
          </code>
        </pre>
      </div>
      <div class="h-stack h-stack--s">
        ${Inputs.button("Open URL", {value: null, reduce: () => window.open(`./${getExportUrlPart(true)}`)})}
        ${Inputs.button("Copy URL only", {value: null, reduce: () => navigator.clipboard.writeText(getExportUrl(true))})}
        ${Inputs.button("Copy", {value: null, reduce: () => navigator.clipboard.writeText(`<iframe width="100%" height="1359" frameborder="0" src="${getExportUrl(true)}"></iframe>`)})}
      </div>
    </div>`,   
  )}</span>`
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

```js
function toolTipper(element, contentFunc = () => "", props = {}) {
  const parent = html`<div>`;
  // Object.assign(parent.style, {
  //   position: "relative",
  //   display: "inline-flex"
  // });
  parent.append(element);
  Object.assign(props, {
    followCursor: false,
    allowHTML: true,
    interactive: true,
    trigger: "click",
    placement:'bottom',
    hideOnClick: "toggle",
    theme: 'light-border',    
    content: contentFunc(),
    onClickOutside: (instance) => instance.hide()
  });
  const instance = tippy(parent, props);
  // element.onmousemove = element.onmouseenter = (e) => {
  //   instance.setContent(contentFunc(e.offsetX, e.offsetY));
  // };
  return parent;
}

```