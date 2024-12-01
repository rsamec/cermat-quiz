---
title: Výběr úloh
theme: ["wide"]
sidebar: true
pager: true
footer: false
toc: false
style: /assets/css/builder.css
---


<link rel="stylesheet" data-theme="gray" href="./data/gray-theme.css" disabled>
<link rel="stylesheet" data-theme="color" href="./data/color-theme.css" disabled>

```js
 function switchStyle(newStyle) {
    // Remove the existing stylesheet if present
    const links = document.querySelectorAll('link[data-theme]');

  // Disable all stylesheets
  links.forEach((link) => (link.disabled = true));

  // Enable or add the new stylesheet
  let newLink = Array.from(links).find((link) => link.getAttribute('data-theme').includes(newStyle));
  if (newLink){
    newLink.disabled = false;
    console.log(newLink.disabled)
  }
  }

const themeInput = Inputs.button([
  ["Default", () => {switchStyle('none'); return 'none'}],
  ["Gray", () => {switchStyle('gray'); return 'gray'}],
  ["Color", () => {switchStyle('color'); return 'color'}],
], {value: 0, label: "Theme"})

// const themeInput = Inputs.radio(new Map([
//   ["Default", 'none'],
//   ["Gray", 'gray'],
//   ["Color", 'color'],
// ]), {value: 'none', label: "Theme"});

const layoutInput = Inputs.radio(new Map([
  ["Sloupce", 'multiColumn'],
  ["Masonry", 'masonry'],
  ["Tabulka", 'grid-column'],
]), {value: 'multiColumn', label: "Layout"});

const theme = Generators.input(themeInput);
const layout = Generators.input(layoutInput);

const controlsInput = Inputs.form({
  useFormControl:Inputs.toggle({ label: "Formulář", value: true}),
  useResources:Inputs.toggle({ label: "Řešení", value: false}),
  useAIHelpers:Inputs.toggle({ label: "AI", value: false}),
  useCode:Inputs.toggle({ label: "Název testu", value: true}),
})
const controlsSetting = Generators.input(controlsInput);

```

```js
import * as a from "npm:@appnest/masonry-layout";
import {categories} from './utils/quiz-utils.js';
import { fromEvent, combineLatest, from, startWith, map} from 'rxjs';
import {parseCode, formatCode, formatSubject, formatPeriod} from './utils/quiz-string-utils.js';
import {convertQueryParamToQuestions, convertFlagsToQueryParam, convertQuestionToQueryParam, cls} from './utils/string-utils.js';
import {renderedQuestionsPerQuizWithInputs} from './components/quiz-form.js';

const quizLangCategories = await FileAttachment("./data/quiz-lang-categories.json").json();
const quizGeneratedCategories = await FileAttachment("./data/quiz-categories.json").json();
const quizCategories = ({
  ...quizLangCategories,
  ...quizGeneratedCategories
})

const quizQuestionsMap = await FileAttachment(`./data/quiz-${observable.params.subject}-${observable.params.period}.json`).json();
const questionsMaxLimit = 400;
```

```js

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

const resetValue = (input, defaultValue) => {
  input.value = defaultValue;
  input.dispatchEvent(new Event("input", {bubbles: true}));
}
const years = Object.keys(Object.groupBy(filteredQuizCategories, ({year}) => year));
const selectedYearsInput = Inputs.select(years,{ multiple:true, label:"Rok"});
const selectedYears = Generators.input(selectedYearsInput);

const codes = Object.keys(Object.groupBy(filteredQuizCategories, ({code}) => code));
const selectedCodesInput = Inputs.select(codes,{ multiple:true, format: d => formatCode(d), label:"Test" });
const selectedCodes = Generators.input(selectedCodesInput);

const uniqueCategories = Object.keys(Object.groupBy(filteredQuizCategories, ({Category}) => Category));
const selectedCategoriesInput = Inputs.select(uniqueCategories,{ multiple:true, label:"Kategorie"});
const selectedCategories = Generators.input(selectedCategoriesInput);

const toBadge = (selected, selectedInput, label) => selected.length > 0 ? html`<div class="badge">
  ${label != null ? `${label}: ${selected.length}`: `${selected.join(", ")}` }
  <i class="fa-solid fa-xmark" onClick=${() => resetValue(selectedInput, [])}></i>
</div>`: ''

```
<details>
    <summary>
    Filtrování úloh
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
<div class="h-stack h-stack--l h-stack--wrap">
  ${toBadge(selectedYears, selectedYearsInput)}
  ${toBadge(selectedCodes, selectedCodesInput,"Testy")}
  ${toBadge(selectedCategories, selectedCategoriesInput, "Kategorie")}
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

const search = view(Inputs.search(filtered,{placeholder: "Vyhledej úlohy…"}));


```

<details>
    <summary>
    Možnosti zobrazení
    </summary>
  <section>
       ${themeInput}
       ${layoutInput}
       ${controlsInput}
  </section>
</details>

```js
function combineInputValues(inputs) {  
  const inputObservables = inputs.map(([key,input]) => 
    fromEvent(input, 'input').pipe(
      map(event => [key, input.value]),
      startWith([key,[]]) // Initialize each input with an empty string
    )
  );

  return combineLatest(inputObservables);
}
```

```js
const selections$ = combineInputValues(selections.map(d => d.input));
const selectedQuestions = Generators.observe((notify) => {
  selections$.subscribe({
    next: value => notify(value)
  });
  notify([]);
  return () => selections$.unsubscribe();
});
```
```js
const columnsSetting = { theme, layout}
const queryValue = selectedQuestions.map(([code,values]) => values?.length > 0 ? [code].concat((values ?? []).join(",")) :[]).filter(d => d.length > 0).join("|");
const getExportUrlPart = (usePrint) => `./${usePrint ? 'quiz-print':'quiz'}-${observable.params.subject}-${observable.params.period}?q=${queryValue}&${convertFlagsToQueryParam(usePrint? {useCode: controlsSetting.useCode}: {...columnsSetting, ...controlsSetting})}`
const getExportUrl = (usePrint) => `${window.location.origin}/${getExportUrlPart(usePrint)}`
const selectedQuestionsCount = selectedQuestions.flatMap(d => d[1]).length;

display(html`${selectedQuestionsCount > 0
            ? html`<div class="tip" label="Sdílet test">
              <div class="h-stack" h-stack--wrap">
                <h2 style="flex:1;">${selectedQuestionsCount} vybráno</h2>
                <div class="h-stack h-stack--l h-stack-items--center h-stack--wrap">
                  <a class="h-stack h-stack--s h-stack-items--center" href=${getExportUrlPart(false)} target="_blank" title="Sdílet"><i class="fa-solid fa-share"></i></a>
                  <a class="h-stack h-stack--s h-stack-items--center" href=${getExportUrlPart(true)} target="_blank" title="Tisk"><i class="fa-solid fa-print"></i></a>
                  <button class="icon-button" onClick=${() => navigator.clipboard.writeText(getExportUrl(false))}><i class="fa-regular fa-copy"></i></button>
                </div>  
              </div>
            <div>`
          :html`<div class="tip" label="Sdílet test"><i>Pro sestavení vlastního testu zvolte úlohy níže.</i></div>`}`)

```

```js

const filteredQuestions = search.length > questionsMaxLimit 
  ? search.filter((d,i) => i < questionsMaxLimit)
  : search 


const parameters = ({
  questions: convertQueryParamToQuestions(convertQuestionToQueryParam(filteredQuestions)),
  subject:observable.params.subject,
  quizQuestionsMap,
  displayOptions:{ 
    questionCustomClass:'break-inside-avoid-column'
  },
})

const {renderedQuestions, indexMap} = renderedQuestionsPerQuizWithInputs(parameters);
const gap = 10;
const questions = parameters.questions;

const selections = renderedQuestions.map((d,index) => {
  const code = questions[index][0];
  const ids = indexMap[code];
  const component = selectable({
      multiple:true,
      options:d.map((content,i) => ({value:ids[i], content }))
    });
    const input = [code,component];
  return {
    component,
    input
  }
})

const selectAllButton = (selected) =>  html`<button class="a-button" onclick=${(e) => selected.component.toggleSelectAll()}>Vybrat vše</button>`
const codeComponent = (i) => html`<span class="title">${formatCode(questions[i][0])} ${selectAllButton(selections[i])}</span>`

display(
  html`<div class="v-stack v-stack--xl">
        ${(layout === "grid-column") 
          ? selections.map((d,index) => html`<details class="quiz-selector" open><summary>${codeComponent(index)}</summary><div class="grid-column-auto">${d.component}</div></details>`)
        : (layout === "masonry")
          ? selections.map((d,index) => html`<details class="quiz-selector" open><summary>${codeComponent(index)}</summary><masonry-layout gap=${gap}>${d.component}<masonry-layout></details>`)
          :selections.map((d,index) => html`<details class="quiz-selector" open><summary>${codeComponent(index)}</summary><div class="multi-column">${d.component}</div></details>`)
        }
  </div>`)
```

```js
function selectable(config={}) {
  // get defaults or overrides config props
  const {
    multiple=false,
    options=[],
    activeClass="active",
  } = config
  
  // validate options structure
  if (options.some(option => option.value == null || option.content == null)) throw TypeError("all options must have content and value")
  if (new Set(options.map(opt=>opt.value)).size !== options.length) throw RangeError("all option's values must be unique")
  
  // populate with selected flag
  const _options = options.map(option => ({...option, selected: !!option.selected}) )
  
  function handleClick(elm, value, index, selected) {
    elm.classList.remove(activeClass)
    
    if (!multiple) {
      _options.forEach((_option, _index) => {
        if (_index !== index) {
          _option.selected = false;
        }
      })
      div.querySelectorAll(`div.sel-q`).forEach(button => {
        button.classList.remove(activeClass)
      })
    }
    
    _options[index].selected = selected !== undefined? selected: !_options[index].selected
    if (_options[index].selected) {
      elm.classList.add(activeClass)
    }
    
    if (multiple) {
      div.value = _options.filter(option => option.selected).map(option => option.value)
    } else {
      div.value = (_options.find(option => option.selected) || {}).value || null
    }
    
    div.dispatchEvent(new CustomEvent("input"))
  }
  const buttons = options.map((option, index) => {
      const button = html`<div class="sel-q ${option.selected ? activeClass : ""}">${option.content}</div>`;
      button.addEventListener("click", () => { handleClick(button, option.value, index) })
      return button;
    });

  const div = html.fragment`${buttons}`
    
  const toggleSelectAll = () => {
    const isAllSelected = buttons.every((button, index) => _options[index].selected);
    
    
    buttons.forEach((button,index) => {
      const option = options[index];
      handleClick(button, option.value, index, isAllSelected ? false : true)
    })
  }
  div.toggleSelectAll = toggleSelectAll;
  if (multiple) {
    div.value = []
  } else {
    div.value = null
  }
  
  return div;
}

```

