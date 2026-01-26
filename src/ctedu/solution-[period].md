---
title: CT_EDU_ROZBOR
sidebar: true
footer: false
pager: true
toc: false
style: /assets/css/print-solution.css
titleFormat: extractPath
---


```js

import mdPlus from '../utils/md-utils.js';
import { parseQuiz } from '../utils/quiz-parser.js';
import wordProblems from './word-problems.js';
import { isPredicate, generateAIMessages } from "../utils/deduce-utils.js";
import { deduceTraverse, highlightLabel, renderChat } from '../utils/deduce-components.js';
import { normalizeImageUrlsToAbsoluteUrls, baseMediaPublic } from '../utils/quiz-string-utils.js';
import { formatPeriod, baseUrl } from './utils.js'
import { providersConfig } from '../utils/quiz-utils.js';
import { localStorageSubject } from '../utils/storage.utils.js'
import Fraction from 'fraction.js';


const toggleExpandAll = () => {
  const details = document.querySelectorAll("main details");
    if (!details.length) return;

    // Check if all details are currently open
    const allOpen = Array.from(details).every(d => d.open);

    // Toggle
    details.forEach(d => {
      d.open = !allOpen;
    });
}

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.code === "Space") {
    e.preventDefault();
    toggleExpandAll()
  }
});

const defaultProviderCode = "default-ai-provider"
const defaultProvider$ = localStorageSubject(defaultProviderCode,providersConfig[0], {
    from: value => providersConfig.find(d => d.shortName === value),
    to: value => value.shortName
})

// const baseMediaPublic = "http://127.0.0.1:8080/"
const period = observable.params.period;
const content = await FileAttachment(`./${observable.params.period}/index.md`).text();
const notebookArtifacts = await FileAttachment(`../notebook-lm/data/artifacts-${observable.params.period}.json`).json();
const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [`${baseUrl}/${period}`])
const quiz = parseQuiz(rawContent);
const ids = quiz.questions.map(d => d.id);

const selectedProvider = defaultProvider$.value;

const wordProblem = wordProblems[period] ?? {};

function renderButtons(template, values){
  
  const hasValues = values?.filter(([key, value]) => value.deductionTree != null).length > 0;
  const prompts = [
    {label:"Smyslupnost", query:`${template} \n Vysvětli, proč dáva smysl řešit výše uvedenou konkrétní úlohu. Jaké principy a koncepty se žák při řešení úlohy naučí? Ukaž propojení teorie s reálným světem, kde se tento koncept běžně uplatňuje. Nevracej výsledek ani postup řešení.`},
    {label:"Řešení", query:`${template}`}
  ];

  if (hasValues){
      const messages = generateAIMessages({
        template,
        deductionTrees:values.map(([key, value]) => [`Řešení ${key}`,value.deductionTree])});
      prompts.push(...[
        {label:"Krokové řešení", query:messages.steps},
        {label:"Obdobné úlohy", query:messages.generateMoreQuizes},
        {label:"Pracovní list", query:messages.generateSubQuizes},
        {label:"Generalizace", query:messages.generateSubQuizes},
       ])
  }

  const messages = generateAIMessages({
        template,
        deductionTrees:values.map(([key, value]) => [`Řešení ${key}`,value.deductionTree])});
   
  return html.fragment`<details class="break-inside-avoid-column no-print">
      <summary>AI prompts</summary>
      <div class="h-stack h-stack--s h-stack--end h-stack--wrap">${prompts.map(d => renderChatButton(d.label, d.query))}
      </div>
    </details>`
}

const output = ids.map(id => {
   const values = (wordProblem[id] != null)
   ? [[id, wordProblem[id]]] 
   : [1, 2, 3, 4]
    .map(i => `${id}.${i}`)
    .map(subId => wordProblem[subId])
    .filter(Boolean)
    .map((d, index) => [`${id}.${index +1}`, d])

  const artifacts = notebookArtifacts[id] ?? []
  
  return html.fragment`
  ${mdPlus.unsafe(quiz.content([id], { ids, render: 'content' }), { docId: `${period}-${id}` })}
  ${renderButtons(quiz.content([id], { ids, render: 'content' }), values)}
  ${values?.length > 0 && artifacts.length > 0
  ? html.fragment`<details><summary>AI artifacts</summary>
  ${artifacts.map(a => {
    if (a.kind == 7) return html`<img src=${baseMediaPublic}/${period}/${a.title}.webp />`
    if (a.kind == 1) return html`<audio src=${baseMediaPublic}/${period}/${a.title}.m4a playsinline muted controls style="min-width: 100px;"></audio>`
    return ''
  })}</details>
  ${values.map(([key, value]) => html`<div>
  ${value.deductionTree != null ? html`<details>
  <summary>Rozbor krok za krokem - ${key}
  </summary>
  <div class="card">${renderChat(value.deductionTree)}</div>
  </div>` : ''}  
</details>`)}
`: ''}`
})

// function renderChatButton(label, query){
//   return html`<a style="height:34px;" href="#" onclick=${(e) => {
//                     e.preventDefault();
//                     window.open(`https://chat.openai.com/?q=${encodeURIComponent(query)}`)
//                   }}><img style="height:34px;" src="https://img.shields.io/badge/chatGPT-74aa9c?style=for-the-badge&logo=openai&logoColor=white&label=${encodeURIComponent(label)}" alt="ChatGPT" /></a>`
// }

function renderChatButton(label, query){
  const provider = selectedProvider;
  return html`<a href="${provider.url}${encodeURIComponent(query)}" target="_blank"><button class="btn btn--dual h-stack"><div class="btn__left-part">${label}</div><div class="btn__right-part">${provider.shortName}<div/></button></a>`
}

const buttonInput = Inputs.button(html`<i class="fa-solid fa-plus" title="expand/collapse all"></i>`, {reduce:() => {
  toggleExpandAll()
}})
buttonInput.className = ''
buttonInput.querySelector("button").className = "fab";
```
<style>
details.solutions > summary > h1, h2 {
    display:inline-block;
}
</style>


${buttonInput}


```js
display(html`<div class=root>${output}</div>`)

```