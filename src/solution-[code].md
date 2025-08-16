---
title: Rozbor řešení
sidebar: true
footer: false
pager: true
toc: true
style: /assets/css/print-solution.css
---

```js

import mdPlus from './utils/md-utils.js';
import { parseQuiz } from './utils/quiz-parser.js';
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, formatCode, text, isEmptyOrWhiteSpace } from './utils/quiz-string-utils.js';
import wordProblems from './math/word-problems.js';
import { isPredicate, jsonToMarkdownChat, generateAIMessages } from "./utils/deduce-utils.js";
import { deduceTraverse, highlightLabel, renderChat } from './utils/deduce-components.js';
import Fraction from 'fraction.js';

const code = observable.params.code;
const d = parseCode(code);
const baseUrl = `${baseDomainPublic}/${d.subject}/${d.period}/${code}`
const content = await text(`${baseUrl}/index.md`);


const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [baseUrl])
const quiz = parseQuiz(rawContent);


const merge = (f, s) => {
  return Object.keys(s).reduce((merged, key) => {
    merged[key] = { ...f[key], ...s[key] }
    return merged;
  }, { ...f })
}
const expressions = await FileAttachment('./data/math-results.json').json();
const geometry = await FileAttachment('./data/math-geometry.json').json();

const result = Object.keys(geometry).reduce((merged, key) => {
  merged[key] = merge(expressions[key], geometry[key])
  return merged;
}, { ...expressions })



const answers = result[code] ?? {};
const ids = quiz.questions.map(d => d.id);

const wordProblem = wordProblems[code] ?? {};
const output = ids.map(id => {
   const values = (answers?.[id] != null || wordProblem[id] != null)
   ? [[id, answers[id] ?? wordProblem[id]]] 
   : [1, 2, 3, 4]
    .map(i => `${id}.${i}`)
    .map(subId => answers?.[subId] ?? wordProblem[subId])
    .filter(Boolean)
    .map((d, index) => [`${id}.${index +1}`, d])
  
  return html.fragment`
  ${mdPlus.unsafe(quiz.content([id], { ids, render: 'content' }), { docId: `${code}-${id}` })}
  ${values?.filter(([key, value]) =>  value.deductionTree != null).length > 0
      ? html.fragment`
      <div class="h-stack h-stack--wrap">
      <div>${renderChatButton("Vysvětli", generateAIMessages({
        template: quiz.content([id], { ids, render: 'content' }),
        deductionTrees:values.map(([key, value]) => [`Řešení ${key}`,value.deductionTree])}).explainSolution)}
      </div>
    </div>`:''}
  ${values?.length > 0 
  ? html.fragment`
  ${values.map(([key, value]) => html`<div class="card break-inside-avoid-column">
  ${(value.results ?? []).map(d => renderResult(key, d))}
  ${value.deductionTree != null ? html`<div>
  <div class="h-stack">
    <div style="flex:1">${key}</div>
  </div>
  ${renderChat(value.deductionTree)}
  </div>` : ''}  
</div>`)}
`: ''}`
})

function normalizeMath(value) {
  return value
    .replace(/±/g, `\\pm`)
    .replace(/\$\$(\s+)\$\$/g, '$$$\n$$$');
}
function renderResult(key, { Name, Answer, TemplateSteps }) {
  return html`<h3>${Name}</h3>
  ${Answer != null ? html`<div class="card">
    ${mdPlus.unsafe(normalizeMath(Answer))}
  </div>`: ''}
<div class="v-stack v-stack--m">${TemplateSteps.map((d, i) =>
    html`<div class="v-stack v-stack--l">
      <video src="./assets/math/${code}/${key}-${i}.mp4" playsinline muted controls></video>
      ${d.Steps?.length > 0 ? renderTemplateSteps(d) : ''}
  </div>`)}
</div>`
}
function renderTemplateSteps({ Name, Steps }) {
  return html`<details class="solution">
  <summary class="solution" >${Name}</summary>
  <div class="grid grid-cols-1" style="grid-auto-rows: auto;">
    ${Steps.map((d, i) => renderStep(d, i))}
  </div>
  </details>`
}

function renderStep({ Step, Hint, Expression }, index) {
  return html`<div class="card">
  <div class="h-stack h-stack--m"><span style="font-size:60px">${index + 1}</span>${mdPlus.unsafe(normalizeMath(Step))}</div>  
  <div>${mdPlus.unsafe(normalizeMath(Expression))}</div>
  ${!isEmptyOrWhiteSpace(Hint) ? html`<div class="tip">${Hint}</div>` : ''}
  </div>`
}

function renderChatButton(label, query){
  return html`<a style="height:34px;" href="#" onclick=${(e) => {
                    e.preventDefault();
                    window.open(`https://chat.openai.com/?q=${encodeURIComponent(query)}`)
                  }}><img style="height:34px;" src="https://img.shields.io/badge/chatGPT-74aa9c?style=for-the-badge&logo=openai&logoColor=white&label=${encodeURIComponent(label)}" alt="ChatGPT" /></a>`
}



```

<style>

details.solutions > summary > h1, h2 {
    display:inline-block;
}
</style>

## ${formatCode(code)}
${answers == null ? html`<div class="warning" label="Upozornění">K tomuto testu v tuto chvíli neexistují žádná řešení.</div>`:''}


```js
display(html`<div class=root>${output}</div>`)
```
