---
title: Řešení slovních úloh - členění dle pravidel
footer: false
pager: true
toc: false
sidebar: true
---

```js
import mdPlus from "../utils/md-utils.js"
import { inferenceRuleWithQuestion } from '../math/word-problems.js';
import { formatPredicate, mapNodeChildrenToPredicates, jsonToMarkdownChatEx } from "../utils/deduce-utils.js";
import { extractSets, generateCombinations,renderVennDiagram, render as renderUpSetJS} from 'npm:@upsetjs/bundle';
import { formatCode, parseCode, formatPeriod, formatShortCodeAlt, formatShortCode, formatVersion} from '../utils/quiz-string-utils.js';
import { rulesCategories } from '../utils/quiz-utils.js';
import { unique, download } from "../utils/common-utils.js";

const wordProblemsModule = await import(`../${observable.params.source}/word-problems.js`);
const wordProblems = wordProblemsModule.default;


import { parser } from '@lezer/markdown';
import { getQuizBuilder } from "../utils/parse-utils.js";
import { renderMarkdownWithCopy } from "../utils/render-utils.js";
const getSelections = (selection) => {
  return (selection?.sets != null ? [...selection.sets.values()].map(d => d.name) : selection !=  null ? [selection.name]: [])
}

```
# Členění dle odvozovacích pravidel


```js
const metricsData = await FileAttachment(`../${observable.params.source}/word-problems-metrics-rules.json`).json();
const sets = extractSets(metricsData).filter(d => !["eval-option"].includes(d.name));
const combinations = generateCombinations(sets, {type:'distinctIntersection', order: 'cardinality:desc', min: 2})
const selection = view(UpSetJSElement(sets, combinations, {height: 1500, theme: mode, mode:'click'}))
```
${onlyHighlightedInput}

<h2>${selection?.name ?? '-- No selection --'}</h2>    
${selection != null ? html`<details open>
    <summary>Seznam úloh</summary>
    <ul>${Object.entries(Object.groupBy((selection?.elems ?? []), d => d.code)).map(([code,values]) => html`<li><a href=../${observable.params.source}/print-${code} target="_blank">${code}</a> - ${values.map(d => d.key).sort((f,s) => f.localeCompare(s, undefined, { numeric: true })).join(", ")}</li>`)}</ul>
</details>
<details open>
    <summary>Úlohy a jejich řešení (markdown formát - vhodný pro AI/automatizaci)</summary>  
    <div class="card">
      ${renderMarkdownWithCopy(renderLinks(selection), "md")}
    </div>
</details>`: html`<div class="warning">Není vybráno žádné pravidlo. Kliknutím vyberte pravidlo či kombinaci pravidel.</div>`}


```js
const markdownParser = parser.configure([]);
function makeQuizBuilder(normalizedQuiz) {  
  const parsedTree = markdownParser.parse(normalizedQuiz);
  return getQuizBuilder(parsedTree, normalizedQuiz,{});
}

const quizQuestionsMap = await FileAttachment(`../${observable.params.source}/quiz-math.json`).json();

const filteredQuizCategoriesMap = Object.entries(wordProblems).flatMap(([code, codeProblems]) => {  
  const parsedCode = parseCode(code);
  const questionMap = quizQuestionsMap
  
  const quiz = questionMap[code];
  if (quiz == null) return [];
  const builder = makeQuizBuilder(quiz.rawContent)
  return Object.entries(Object.groupBy(Object.entries(codeProblems), ([id]) => id.split('.')[0])).map(([groupKey, problems]) => {
      return {
        id: groupKey,
        name: builder.questions.find(q => q.id == groupKey)?.title ?? groupKey,
        code,    
        builder,      
        deductionTrees: problems.map(([id, value]) => value.deductionTree)
      };
    })
  }
)
.reduce((out, d) => {
  out[`${d.code}-${d.id}`] = d;
  return out;
}, {})

const onlyHighlightedInput = Inputs.toggle({
  label:"Filtrovat pouze zvýrazněné kroky řešení",
  value: false
})
const onlyHighlighted = Generators.input(onlyHighlightedInput);

```

```js

const mode = Generators.observe(notify => {
  const query = matchMedia("(prefers-color-scheme: dark)");
  const changed = () => notify(query.matches ? "dark" : "light");
  changed();
  query.addListener(changed);
  return () => query.removeListener(changed);
})
function renderVenn(sets, combinations){
  const root = html`<div></div>`;
  renderVennDiagram(root,{sets, combinations, height: 500, width})
  return root
}

function UpSetJSElement(sets, combinations = undefined, extras = {}) {
  const props = {
    sets,
    height: 500,
    width,
    selection: null,
  
    ...extras
  };
  if (combinations) {
    props.combinations = combinations;
  }
  const root = html`<div></div>`;

  const render = () => {
    renderUpSetJS(root, props);
  };
  const handler = set => {
    props.selection = set;
    render();
    root.dispatchEvent(new CustomEvent('input'));
  };
  if (!extras.mode || extras.mode === 'hover') {
    props.onHover = handler;
  } else {
    props.onClick = handler;
  }

  render();

  // fulfill value contract
  Object.defineProperty(root, 'value', {
    get: () => props.selection,
    set: value => {
      props.selection = value || null;
      render();
      root.dispatchEvent(new CustomEvent('input'));
    }
  });

  return root;
}
function renderLinks(selection) {  
  const rules = getSelections(selection).flatMap(d => rulesCategories.get(d) ?? [d]);
  return Object.entries(Object.groupBy(selection?.elems ?? [], d => `${d.code}-${d.question}`))
  .map(([key,values], index) => {
    const item = filteredQuizCategoriesMap[key];

    return `${item.builder.content([parseInt(item.id)], { render: 'content' })} \n---\n ${(item.deductionTrees ?? []).map((tree, i) => jsonToMarkdownChatEx(tree,{rules}).filter(d => d.isContext !== true)).map((steps,i,arr) => { const filteredSteps = steps.filter(d=> !onlyHighlighted || d.anyHighlighted); return filteredSteps.length > 0 ? `## ${item.id}.${i+1} - Kroky řešení (${steps.length > filteredSteps.length ? `zobrazeno ${filteredSteps.length} z ${steps.length} kroků` :`celkem ${steps.length} kroků`}) \n\n ${filteredSteps.map((d,i) => `### ${i+1}. ${d.md}`).join("")}`: ''}).filter(d => d != "").join(`---\n`)}`
      
  })
  .join('\n---\n')  
}

```

