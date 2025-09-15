---
footer: false
pager: true
toc: true
style: /assets/css/word-problems.css
---
<style>
  .description {
    font-size: 12px;
    font-style: italic;
  }
 
</style>
```js
import { formatCode, parseCode, formatPeriod, formatVersion} from './utils/quiz-string-utils.js';
import { unique, download } from "./utils/common-utils.js";
import wordProblems from './math/word-problems.js';

import {categories} from './utils/quiz-utils.js';
import { renderChatStepper, useInput } from './utils/deduce-chat.js';
import { jsonToMarkdownChat} from './utils/deduce-utils.js';
import mdPlus from './utils/md-utils.js';
import { parser } from '@lezer/markdown';
import { getQuizBuilder } from "./utils/parse-utils.js";

const questionsMaxLimit = 50;

const quizQuestionsMap4 = await FileAttachment(`./data/quiz-math-4.json`).json();
const quizQuestionsMap6 = await FileAttachment(`./data/quiz-math-6.json`).json();
const quizQuestionsMap8 = await FileAttachment(`./data/quiz-math-8.json`).json();
const quizQuestionsMapD = await FileAttachment(`./data/quiz-math-diploma.json`).json();

function getQuestionMapByPeriod(period){
  if (period == "4"){
    return quizQuestionsMap4
  }
  else if (period == "6"){
    return quizQuestionsMap6
  }
  else if (period == "8"){
    return quizQuestionsMap8
  }
  else if (period == "diploma"){
    return quizQuestionsMapD
  }
}

const quizGeneratedCategories = await FileAttachment("./data/quiz-categories-gemini-2.5-flash.json").json();
const wordProblemsMetrics = await FileAttachment("./data/word-problems-metrics.json").json();

const markdownParser = parser.configure([]);
function makeQuizBuilder(normalizedQuiz) {  
  const parsedTree = markdownParser.parse(normalizedQuiz);
  return getQuizBuilder(parsedTree, normalizedQuiz,{});
}

const filteredQuizCategories = Object.entries(quizGeneratedCategories).flatMap(([code, value]) => {
  const wordProblem = wordProblems[code] ?? {};  
  
  const parsedCode = parseCode(code);      
  const questionMap = getQuestionMapByPeriod(parsedCode.period);
  
  const quiz = questionMap[code];
  const builder = makeQuizBuilder(quiz.rawContent)
  
  return value.questions.map((d,i) => {
      return {
        ...d,
        code,
        year: parsedCode.year,
        period: parsedCode.period,
        subject: parsedCode.subject,
        order: parsedCode.order,
        version: formatVersion(parsedCode),
        predicates:wordProblemsMetrics[code]?.[d.id]?.predicates ?? [],
        hasSolution:wordProblemsMetrics[code]?.[d.id] != null,
        builder,      
        deductionTrees: wordProblem[d.id] != null 
          ? [wordProblem[d.id].deductionTree] 
          : [1, 2, 3, 4]
          .map(i => `${d.id}.${i}`)
          .map(subId => wordProblem[subId])
          .filter(Boolean)
          .map(d => d.deductionTree)

      };
    })
  }
).filter(d => d.subject === "math" && d.hasSolution)

const resetValue = (input, defaultValue) => {
  input.value = defaultValue;
  input.dispatchEvent(new Event("input", {bubbles: true}));
}
const years = Object.keys(Object.groupBy(filteredQuizCategories, ({year}) => year));
const selectedYearsInput = Inputs.select(years,{ multiple:true, label:"Rok"});
const selectedYears = Generators.input(selectedYearsInput);

const periods = Object.keys(Object.groupBy(filteredQuizCategories, ({period}) => period));
const selectedPeriodsInput = Inputs.select(periods,{ multiple:true, format: d => formatPeriod(d), label:"Studium" });
const selectedPeriods = Generators.input(selectedPeriodsInput);

const versions = Object.keys(Object.groupBy(filteredQuizCategories, ({order}) => order));
const selectedVersionsInput = Inputs.select(versions,{ multiple:true, format: order => formatVersion({order}), label:"Verze" });
const selectedVersions = Generators.input(selectedVersionsInput);


const codes = Object.keys(Object.groupBy(filteredQuizCategories, ({code}) => code));
const selectedCodesInput = Inputs.select(codes,{ multiple:true, format: d => formatCode(d), label:"Test" });
const selectedCodes = Generators.input(selectedCodesInput);

const uniquePredicates = new Map([
  ["Porovnání rozdílem",["comp"]],
  ["Porovnání podílem",["comp-ratio"]],
  ["Část z celku", ["ratio"]],
  ["Poměr část ku části", ["ratios"]],
  ["Stav a změna stavu", ["delta","transfer"]],
  ["Úměrnosti", ["proportion"]],
  ["Škálování", ["scale","slace-invert","nth-factor"]],
  ["Posuny",["slide","slide-invert"]],
  ["Rozdělování", ["rate","quota"]],
  ["Spojování", ["sum","sum-combine", "product", "product-combine"]],
  ["Převod jednotek", ["unit"]],
  ["Převod jednotek", ["unit"]],
  ["Vztahy úhlů", ["comp-angle", "triangle"]],
  ["Největší společný dělitel", ["gcd"]],
  ["Nejmenší společný násobek", ["lcd"]],
  ["Výrazy", ["eval-expr", "simpl-expr"]],
  ["Pythagorova věta", ["pythagoras"]],
  ["Vzory opakování", ["sequence","nth", "pattern","balanced-partition"]],
  ["Zaokrouhlování", ["round"]],
  ["Zdravý rozum", ["common-sense"]],
])
const selectedPredicatesInput = Inputs.select(uniquePredicates,{ multiple:true, label:"Predikáty"});
const selectedPredicates = Generators.input(selectedPredicatesInput);

const controlsInput = Inputs.radio(
    new Map([
      ["Pouze zadání", "A"],
      ["Pouze řešení", "B"],
      ["Zadání a řešení", "AB"]
    ]),
    {value: "AB"}
  )
const controls = Generators.input(controlsInput);

const viewInput = Inputs.radio(
    new Map([
      ["Náhled", "view"],
      ["Odkazy", "links"],
    ]),
    {value: "view"}
  )
const viewValue = Generators.input(viewInput);


const toBadge = (selected, selectedInput, label) => selected.length > 0 ? html`<div class="badge">
  ${label != null ? `${label}: ${selected.length}`: `${selected.join(", ")}` }
  <i class="fa-solid fa-xmark" onClick=${() => resetValue(selectedInput, [])}></i>
</div>`: ''

function renderMarkdownWithCopy(content, lang){
  return html`<div class="observablehq-pre-container" data-language="${lang}">
  <button title="Copy code" class="observablehq-pre-copy" onclick=${() => navigator.clipboard.writeText(content)}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 6C2 5.44772 2.44772 5 3 5H10C10.5523 5 11 5.44772 11 6V13C11 13.5523 10.5523 14 10 14H3C2.44772 14 2 13.5523 2 13V6Z M4 2.00004L12 2.00001C13.1046 2 14 2.89544 14 4.00001V12"></path></svg></button>
  <div style="padding: 0px 20px;">
  ${mdPlus.unsafe(content)}
  </div>
  </div>`
}
```

# Slovní úlohy

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
        ${selectedPeriodsInput}
      </div>
      <div>
        ${selectedVersionsInput}
      </div>
      <div>
        ${selectedPredicatesInput}
      </div>
    </div>
  </section>
</details>
<div class="h-stack h-stack--l h-stack--wrap">
  ${toBadge(selectedYears, selectedYearsInput)}
  ${toBadge(selectedPeriods, selectedPeriodsInput,"Studium")}
  ${toBadge(selectedVersions, selectedVersionsInput,"Verze")}
  ${toBadge(selectedPredicates, selectedPredicatesInput, "Predikáty")}
</div>



```js
let filtered = filteredQuizCategories;
if (selectedYears.length > 0){
  filtered = filtered.filter(d=> selectedYears.some(year => d.year === year));
}
if (selectedPeriods.length > 0){
  filtered = filtered.filter(d=> selectedPeriods.some(period => d.period === period));
}
if (selectedVersions.length > 0){
  filtered = filtered.filter(d=> selectedVersions.some(order => d.order === order));
}

// if (selectedCodes.length > 0){
//   filtered = filtered.filter(d=> selectedCodes.some(code => d.code === code));
// }

if (selectedPredicates.length > 0){
  filtered = filtered.filter(d=> selectedPredicates.flatMap(d => d).some(predicate => d.predicates.includes(predicate)));
}

const search = view(Inputs.search(filtered,{placeholder: "Vyhledej úlohy…"}));

```

```js
const selected = view(Inputs.table(search,{  
  columns: [
    "name",
    "summary",
    "year",
    "period",
    "version",
  ],
  header: {
    year:"Rok",
    period: "Period",
    name: "Název",
    summary: "Popis",
    version: "Verze",
  },
  width: {
    name: 240,
    year: 40,
    period: 70,
    version: 70,   
  },
  format: {
    name: (d,i,o) => html`<a href="./word-problem-${o[i].code}-n-${o[i].id}" target="_blank">${d}</a>`,
    period: d => html`${formatPeriod(d)}`
  }
}))
```
```js
const selectedToRender = selected.length > questionsMaxLimit ? selected.filter((_,i)=> i < questionsMaxLimit): selected;
```

<div>
  ${controlsInput}
  ${viewInput}
</div>

${html`${selected.length > questionsMaxLimit
            ? html`<div class="caution" label="Limit - maximální počet otázek">
              <div>Zobrazeno <b>${selectedToRender.length}</b> z <b>${selected.length} otázek</b></div>
            <div>`
          :''}`}


${viewValue == 'links' ? html`<ul>${selectedToRender.map(d => html`<li><a href=n-${d.code}-${d.id}>${d.code} - ${d.id}</a></li>`)}</ul>` : html`<div class="card">${renderMarkdownWithCopy(selectedToRender.map(d => (controls.startsWith("A") ? d.builder.content([parseInt(d.id)], { render: 'content' }) : "") + ' ' + (controls.endsWith("B") ?  (controls.startsWith("A") ? `\n---\n`:'') + d.deductionTrees.map(tree => jsonToMarkdownChat(tree).join("")).join("---\n") : "")).join("\n---\n"), 'md')}</div>`}

