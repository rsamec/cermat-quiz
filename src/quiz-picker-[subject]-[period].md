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
import {categories, parseCode, formatCode, formatSubject, formatPeriod} from './utils/quiz-utils.js';
import {convertQueryParamToQuestions, convertFlagsToQueryParam} from './utils/string-utils.js';
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

const filteredQuizCategories = Object.entries(quizCategories).flatMap(([code, value]) =>
  value.questions.map((d) => {
    const parsedCode = parseCode(code);
    return {
      ...d,
      code,
      year: parsedCode.year,      
      period: parsedCode.period,      
      subject: parsedCode.subject,
      Category: categories[parsedCode.subject][d.category],
    };
  })
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
    "Category",
    "code",
    "year",    
  ],
  format: {
    code: d => formatCode(d)
  }
}));
const quizQuestionsMap = await FileAttachment(`./data/quiz-${observable.params.subject}-${observable.params.period}.json`).json();
```

```js
const queryValue = convertQuestionToQueryParam(selectedQuestions);

function convertQuestionToQueryParam(values){
  return Object.entries(Object.groupBy(values, ({code}) => code)).map(([code,values]) => [code].concat(values.map(d=> d.id)).join(",")).join("|");
}
```

```js
const useAIHelpersInput = Inputs.toggle({ label: "Pomocník AI"});
const useAIHelpers = Generators.input(useAIHelpersInput);
const useSolversInput = Inputs.toggle({ label: "Řešení"});
const useSolvers = Generators.input(useSolversInput);

const columnsOptions = new Map([["Šířka sloupce", false],["Počet sloupců",true]]);
const columnsInput = Inputs.form({
  useColumnCount: Inputs.radio(columnsOptions, {value: columnsOptions.get("Šířka sloupce")}),
  columnWidth: Inputs.range([10,36], {step:1, value: 24, label: "Šířka sloupce"}),
  columnCount: Inputs.range([1,6], {step:1, value: 2, label:"Počet sloupců"}),  
  useBreakInside: Inputs.toggle({label:"Nezalamovat v rámci testu"}),  
  useBreakBefore: Inputs.toggle({label:"Vynucení zalomení v rámci testu"}),
});
const columns = Generators.input(columnsInput);
```

<div class="card">
  <details>
    <summary>
      Možnosti zobrazení
    </summary>
    <section>
    <div class="grid grid-cols-2">
        <div>
        <b>Více sloupcový layout stránky a možnosti nastavení stránkování v rámci sloupců.</b>
          ${columnsInput}
          </div>
          <div>
        <b>Zobraz tipy</b>
        ${useAIHelpersInput}
        </div>
    </div>
  </section>
  </details>
</div>  

```js
import {renderQuiz} from './components/quiz-form.js';
```

```js
const displayOptions = {useAIHelpers, useBreakInside: columns.useBreakInside, useBreakBefore:columns.useBreakInside, useFormControl:true};
const actionsButton =Inputs.button(["Sdílet","Tisk"].map(d => [d, () => window.open(`./quiz-${observable.params.subject}-${observable.params.period}?q=${queryValue}&${convertFlagsToQueryParam(displayOptions)}&columns=${toColumnsStyleValue(columns)}&useFormControl=${d ==="Tisk"? false: true}`)]))
```

```js
const parameters = ({
  questions: convertQueryParamToQuestions(queryValue),
  subject:observable.params.subject,
  quizQuestionsMap,
  displayOptions
})
const quizWithControls = renderQuiz(parameters);
display(renderQuizInColumns(html`${quizWithControls.map(d=> d)}`));
```
```js
function toColumnsStyleValue(columns){
  return columns.useColumnCount === true && columns.columnWidth > 1 
    ? `${columns.columnCount}` 
    : columns.useColumnCount === false 
      ?`${columns.columnWidth}rem`
      : '';
}
function renderQuizInColumns(content){ 
  return html`<div style="columns:${toColumnsStyleValue(columns)}">${content}</div>`
}
```