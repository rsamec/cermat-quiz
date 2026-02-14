---
title: CT_EDU Barevný rozpad výpočtu
sidebar: true
pager: false
footer: false
toc: false
style: /assets/css/color-expression.css
titleFormat: extractPath
---

```js

import mdPlus from "../utils/md-utils.js";
import { html as rhtml } from '../utils/reactive-htl.js';
import { signal,computed } from '@preact/signals-core';

import { parseQuiz } from '../utils/quiz-parser.js';
import { colorifyDeduceTree, jsonToMarkdownTree, computeTreeMetrics } from "../utils/deduce-utils.js";
import { convertTree, getAllLeafsWithAncestors } from '../utils/parse-utils.js';
import { normalizeImageUrlsToAbsoluteUrls } from "../utils/quiz-string-utils.js";

const wordProblemsModule = await import(`../${observable.params.source}/word-problems.js`);
const wordProblems = wordProblemsModule.default;

const metadata = await FileAttachment(`../${observable.params.source}/${observable.params.code}/key.json`).json();
const rawContentData = await FileAttachment(`../${observable.params.source}/${observable.params.code}/index.md`).text();
const rawContent = normalizeImageUrlsToAbsoluteUrls(rawContentData, [`${observable.params.source}/${observable.params.code}`])
const code = observable.params.code;

const quiz = parseQuiz(rawContent);

const ids = quiz.questions.map(d => d.id);

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
        <div style="padding: 5px">${mdPlus.unsafe(quiz.content([id], { ids, render: 'content' }))}</div>        
        <div class="v-stack v-stack--m">${values       
        .filter(([key,value]) => useColors(value.deductionTree))
        .map(([key, value]) => {
            const dTree = value.deductionTree;
            const hackedDTree = dTree.children.some(d => d.kind == "eval-option") ? dTree.children.find(d => d.kind != "eval-option"): dTree;        
            
            const {depth, width, predicates, rules} = computeTreeMetrics(hackedDTree); 
            const ruleNames = rules.map(d => d.name);
            if (['convertRatioCompareToRatiosRule','convertToPartToPartRatios', 'nthTermExpressionRule', 'nthTermRule','solveEquationRule',
             'convertRatioCompareToTwoPartRatioRule', 'convertRatioCompareToRatioRule','commonSense', 'alligationRule', 'partEqualRule'].some(d => ruleNames.includes(d))) return '';
            
            const finalDepth = depth - 1;
            const colorifyParamsForm = Inputs.form({
                maxDepth: Inputs.range([0, finalDepth], {step: 1, value: finalDepth, label: "Maximální hloubka"}),
                axioms:  Inputs.toggle({label:"Axioms", value: true}),
                deductions: Inputs.toggle({label:"Deductions", value: true}),
            });
        
            // const notSupportedRules = ["convertToUnitRule", "evalToQuantityRule", "commonSense","alligationRule"]
            // if (notSupportedRules.some(d => ruleNames.includes(d))) return ''

            

            const signalValue = signal(colorifyParamsForm.value);
            colorifyParamsForm.addEventListener("input", e => {
                signalValue.value = colorifyParamsForm.value;
            })            
            
            return rhtml`<div><h3>Úloha ${key}</h3><div class="card">${colorifyParamsForm}</div><div>${computed(() => {   
                const {deductionTree, colorsMap}  = colorifyDeduceTree(hackedDTree,signalValue.value );
                return mdPlus.unsafe(jsonToMarkdownTree(deductionTree, 0, colorsMap).join(''))        
            })}</div></div>`
        })}</div>
    </div>`
     })}
</div>`)
```

