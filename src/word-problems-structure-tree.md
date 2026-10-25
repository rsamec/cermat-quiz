---
title: Struktura řešení slovních úloh
footer: false
pager: true
toc: true
style: /assets/css/math-deduce.css
---

```js
import mdPlus from "./utils/md-utils.js"
import { inferenceRuleWithQuestion } from './math/word-problems.js';
import { formatPredicate, mapNodeChildrenToPredicates, jsonToMarkdownChatEx } from "./utils/deduce-utils.js";
import { extractSets, generateCombinations,renderVennDiagram, render as renderUpSetJS} from 'npm:@upsetjs/bundle';
import { formatCode, parseCode, formatPeriod, formatShortCodeAlt, formatShortCode, formatVersion} from './utils/quiz-string-utils.js';
import { unique, download } from "./utils/common-utils.js";
import wordProblems from './cermat/word-problems.js';

import { parser } from '@lezer/markdown';
import { getQuizBuilder } from "./utils/parse-utils.js";
import { renderMarkdownWithCopy } from "./utils/render-utils.js";

```

# Členění dle stromů


```js
const unique = (value, index, array) => array.indexOf(value) === index;

const metricsRulesData = await FileAttachment("./data/word-problems-metrics-tree.json").json();
const sets = extractSets(metricsRulesData).filter(d => !["eval-option"].includes(d.name));
const combinations = generateCombinations(sets, {type:'distinctIntersection', order: 'cardinality:desc', min: 2})
const selection = view(UpSetJSElement(sets, combinations, {height: 10_000, theme: mode, mode:'click'}))

```

${onlyHighlightedInput}
<details open>
    <summary>${selection?.name ?? '-- No selection --'}</summary>       
    <div>${(selection?.elems ?? []).map(d => d.name).join(", ")}</div>
    <div class="card">      
      ${renderMarkdownWithCopy(renderLinks(selection, "md"))}
    </div>
</details>


```js
const markdownParser = parser.configure([]);
function makeQuizBuilder(normalizedQuiz) {  
  const parsedTree = markdownParser.parse(normalizedQuiz);
  return getQuizBuilder(parsedTree, normalizedQuiz,{});
}

const quizQuestionsMap = await FileAttachment(`./data/quiz-math.json`).json();

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
        year: parsedCode.year,
        period: parsedCode.period,
        subject: parsedCode.subject,
        order: parsedCode.order,
        version: formatVersion(parsedCode),
        builder,      
        deductionTrees: problems.map(([id, value]) => value.deductionTree)
      };
    })
  }
)
.filter(d => d.subject === "math")
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
    // renderVennDiagram(root,{sets, combinations, height: 500, width})
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
  // console.log(selection)
  return Object.entries(Object.groupBy(selection?.elems ?? [], d => `${d.code}-${d.question}`))
  .map(([key,values], index) => {
    const item = filteredQuizCategoriesMap[key];
    
    //const steps = item.deductionTrees.map((d,i) => values.filter(d => [item.id,`${item.id}.${i+1}`].includes(d.key)).map(d => d));
    const rules = values.map(d => d.sets).flat();
    return `${item.builder.content([parseInt(item.id)], { render: 'content' })} \n---\n ${(item.deductionTrees ?? []).map((tree, i) => jsonToMarkdownChatEx(tree,{rules}).filter(d => d.isContext !== true)).map((steps,i,arr) => steps.filter(d=> !onlyHighlighted || d.anyHighlighted).length > 0 ? `## ${item.id}.${i+1} - Kroky řešení (${steps.length}) \n\n ${steps.map((d,i) => !onlyHighlighted || d.anyHighlighted ? `### ${i+1}. ${d.md}`: '').join("")}`: '').filter(d => d != "").join(`---\n`)}`
      
  })
  .join('\n---\n')  
}
```

