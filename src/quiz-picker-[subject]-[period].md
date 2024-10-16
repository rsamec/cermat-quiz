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
import {categories, parseCode, formatCode, formatSubject, formatPeriod} from './utils/quiz-utils.js';
import {convertQueryParamToQuestions, convertFlagsToQueryParam} from './utils/string-utils.js';
const quizQuestionsMap = await FileAttachment(`./data/quiz-${observable.params.subject}-${observable.params.period}.json`).json();
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
const actionsButton =Inputs.button(["Otevřít","Tisk"].map(d => [d, () => window.open(`./${getExportUrlPart(d ==="Tisk"? false: true)}`)]))

const getExportUrlPart = (usePrint) => `quiz-${observable.params.subject}-${observable.params.period}?q=${queryValue}&${convertFlagsToQueryParam(displayOptions)}&columns=${toColumnsStyleValue(columns)}&useFormControl=${usePrint}`

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