---
title: Obarvovačka
theme: ["wide"]
sidebar: true
pager: true
footer: false
toc: false
style: /assets/css/color-expression.css
---

```js

import mdPlus from "../utils/md-utils.js";
import { html as rhtml } from '../utils/reactive-htl.js';
import { signal,computed } from '@preact/signals-core';

import { parseQuiz } from '../utils/quiz-parser.js';
import { parseCode, formatCodeAlt } from '../utils/quiz-string-utils.js';
import { colorifyDeduceTree, jsonToMarkdownTree, computeTreeMetrics } from "../utils/deduce-utils.js";
import wordProblems from '../math/word-problems.js';
import { convertTree, getAllLeafsWithAncestors } from '../utils/parse-utils.js';


const code = observable.params.code;

const aiCategoriesData = await FileAttachment(`../data/quiz-categories-gemini-2.5-flash.json`).json();
const aiCategories = Object.fromEntries((aiCategoriesData[code]?.questions ?? []).map(d => [d.id, d]));

const rawContent = await FileAttachment(`../data/form-${observable.params.code}.md`).text();
const quiz = parseQuiz(rawContent);

const ids = quiz.questions.map(d => d.id);



display(html`<h1>${formatCodeAlt(code)}</h1>`)
```

```js

const wordProblem = wordProblems[code];

const valuesMap = ids.map(id => {
  const values = (wordProblem?.[id] != null)
    ? [[id, wordProblem[id]]]
    : [1, 2, 3, 4]
      .map(i => `${id}.${i}`)
      .map(subId => wordProblem?.[subId])
      .filter(Boolean)
      .map((d, index) => [`${id}.${index + 1}`, d])
  return {id,values}
}).filter(({values}) => values.length > 0)

const useColors = deductionTree => {
    return true;
    const context = deductionTree.context;
    return context != null ? context.autoColors || context.colors || context.bgColors : false
}


display(html`<div>
  ${valuesMap
    .filter(({id, values}) => values.some(([key,d]) => useColors(d.deductionTree)))
    .map(({id,values}, i) => {
    return html`<div class="group-${i+1}">
        <details open>
        <summary>
            <span style="font-size: 1.6em; font-weight: 600">${id}. ${aiCategories[id]?.name ?? 'N/A'}</span>
        </summary>
        <div style="padding: 5px">${mdPlus.unsafe(quiz.content([id], { ids, render: 'content' }))}</div>
        </details>
        
        <div class="v-stack v-stack--m">${values       
        .filter(([key,value]) => useColors(value.deductionTree))
        .map(([key, value]) => {
            const {depth, width, predicates, rules} = computeTreeMetrics(value.deductionTree); 
            if (['evalToQuantityRule','convertRatioCompareToRatiosRule','convertToPartToPartRatios', 'nthTermExpressionRule', 'nthTermRule',
             'convertRatioCompareToTwoPartRatioRule', 'convertRatioCompareToRatioRule','commonSense', 'alligationRule', 'partEqualRule'].some(d => rules.includes(d))) return '';
            
            const colorifyParamsForm = Inputs.form({
                maxDepth: Inputs.range([0, depth - 1], {step: 1, value: 3, label: "Maximální hloubka"}),
                axioms:  Inputs.toggle({label:"Axioms", value: true}),
                deductions: Inputs.toggle({label:"Deductions", value: true}),
            });
        
            // const notSupportedRules = ["convertToUnitRule", "evalToQuantityRule", "commonSense","alligationRule"]
            // if (notSupportedRules.some(d => rules.includes(d))) return ''

            

            const signalValue = signal(colorifyParamsForm.value);
            colorifyParamsForm.addEventListener("input", e => {
                signalValue.value = colorifyParamsForm.value;
            })            
            
            return rhtml`<div><h3>Úloha ${key}</h3><div class="card">${colorifyParamsForm}</div><div>${computed(() => {            
                const {deductionTree, colorsMap}  = colorifyDeduceTree(value.deductionTree,signalValue.value );
                return mdPlus.unsafe(jsonToMarkdownTree(deductionTree, 0, colorsMap).join(''))        
            })}</div></div>`
        })}</div>
    </div>`
     })}
</div>`)
```

