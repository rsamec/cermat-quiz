---
title: Výběr úloh
theme: ["wide"]
sidebar: true
pager: true
footer: false
toc: false
style: /assets/css/quiz.css
---

```js

import tippy from 'tippy.js';
import {categories} from './utils/quiz-utils.js';
import {parseCode, formatCode, formatSubject, formatPeriod} from './utils/quiz-string-utils.js';
import {convertQueryParamToQuestions, convertFlagsToQueryParam, convertQuestionToQueryParam, cls} from './utils/string-utils.js';
import {renderedQuestionsPerQuiz} from './components/quiz-form.js';

const quizQuestionsMap = await FileAttachment(`./data/quiz-${observable.params.subject}-${observable.params.period}.json`).json();
const questionsMaxLimit = 30;
```

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

*Pro sestavení vlastního testu zvolte úlohy v tabulce níže.*

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

```js
const selectedQuestions = view(Inputs.table(search, {
   columns: [
    "title",
    "Category",
    "code",
  ],
  header: {
    title: "Úloha",
    Category: "Kategorie úlohy",
    code:"Test"
  },
  required: false,
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
  useFormControl:Inputs.toggle({ label: "Formulář", value:true}),
  useResources:Inputs.toggle({ label: "Řešení", value:false}),
  useAIHelpers:Inputs.toggle({ label: "AI", value: false}),
})
const controlsSetting = Generators.input(controlsInput);

const columnsInput = Inputs.form({
  layoutPerQuiz: Inputs.toggle({label:"Vykreslovat za jednotlivé testy", value: false}),
  useColumns: Inputs.toggle({value:true, label:"Použít sloupce"}),
  columnWidth: Inputs.range([10,36], {step:1, value: 24, label: "Šířka sloupce"}),
  avoidBreakInsideQuestion: Inputs.toggle({label:"Nezalamovat v rámci otázky", value: true}),
  avoidBreakInsideQuiz: Inputs.toggle({label:"Nezalamovat v rámci testu"}),
  useCode: Inputs.toggle({label:"Zobrazovat názvy testů", value: true}),
  theme: Inputs.radio(['none','2-gray-stripped', '3-gray-stripped', '4-gray-stripped'],{value: 'none'})
});
const columnsSetting = Generators.input(columnsInput);
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
const getExportUrlPart = (usePrint) => `./quiz-${observable.params.subject}-${observable.params.period}?q=${queryValue}&${convertFlagsToQueryParam(usePrint? {...columnsSetting}: {...columnsSetting, ...controlsSetting})}`
const getExportUrl = (usePrint) => `${window.location.origin}/${getExportUrlPart(usePrint)}`

display(html`${selectedQuestions.length > 0
            ? html`<div class="tip" label="Sdílet test">
                <div class="h-stack h-stack--l h-stack-items--center h-stack--wrap">
                  <a class="h-stack h-stack--s h-stack-items--center" href=${getExportUrlPart(false)} target="_blank"><span>Otevřít</span><span>↗︎</span></a>
                  <a class="h-stack h-stack--s h-stack-items--center" href=${getExportUrlPart(true)} target="_blank"><span>Tisk</span><i class="fa-solid fa-print"></i></a>
                  <div>
                  ${Inputs.button("Kopírovat url", {value: null, reduce: () => navigator.clipboard.writeText(getExportUrl(false))})}
                  </div>
                </div>  
              </div>
              <div>
              <h2>Počet otázek # ${selectedQuestions.length}</h2>
              <span class="red">${selectedQuestions.length > questionsMaxLimit ? `Náhled limit maximálně ${questionsMaxLimit} úloh.`:''}</span>
                
            <div>`
          :''}`)

```

```js
const filteredQuestions = selectedQuestions.length > questionsMaxLimit ? selectedQuestions.filter((d,i) => i < questionsMaxLimit): selectedQuestions 

const parameters = ({
  questions: convertQueryParamToQuestions(convertQuestionToQueryParam(filteredQuestions)),
  subject:observable.params.subject,
  quizQuestionsMap,  
  displayOptions:{ 
    ...(columnsSetting.avoidBreakInsideQuestion && {questionCustomClass:'break-inside-avoid-column'}),
    ...columnsSetting,
    ...controlsSetting
  },
})

const renderedQuestions = renderedQuestionsPerQuiz(parameters);

const { useCode, theme, layoutPerQuiz, columnWidth, avoidBreakInsideQuiz, useColumns} = parameters.displayOptions;

const questions = parameters.questions;
const codeComponent = (i) => useCode ? html`<h0>${formatCode(questions[i][0])}</h0>`: null

const renderedContent = layoutPerQuiz
    ? html.fragment`${renderedQuestions.map((d,index) => html`${codeComponent(index)}<div class=${cls([(useColumns && index > 0) && 'break-before-page'])} style=${useColumns ? `columns:${columnWidth ?? 24}rem`:''}>${d}</div>`)}`
    : html`<div style=${useColumns ? `columns:${columnWidth ?? 24}rem`:''}>${renderedQuestions.map((d,index) => html`<div class=${cls([avoidBreakInsideQuiz && 'break-inside-avoid-column'])}>${codeComponent(index)}${d}</div>`)}</div>`;

display(renderedContent);

```

