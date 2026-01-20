---
title: CT_EDU_ROZBOR
sidebar: true
footer: false
pager: true
toc: true
style: /assets/css/print-solution.css
titleFormat: extractPath
---

```js
import { providersConfig } from '../utils/quiz-utils.js';
const providers = new Map(providersConfig.map(d => [d.name, d]));
const selectedProviderInput = Inputs.select(providers,{ label:"Poskytovatel"});
const selectedProvider = Generators.input(selectedProviderInput);
```

```js

import mdPlus from '../utils/md-utils.js';
import { parseQuiz } from '../utils/quiz-parser.js';
import wordProblems from './word-problems.js';
import { isPredicate, generateAIMessages } from "../utils/deduce-utils.js";
import { deduceTraverse, highlightLabel, renderChat } from '../utils/deduce-components.js';
import { normalizeImageUrlsToAbsoluteUrls, baseMediaPublic } from '../utils/quiz-string-utils.js';
import { formatPeriod, baseUrl } from './utils.js'

import Fraction from 'fraction.js';


const period = observable.params.period;
const content = await FileAttachment(`./${observable.params.period}/index.md`).text();
const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [`${baseUrl}/${period}`])
const quiz = parseQuiz(rawContent);
const ids = quiz.questions.map(d => d.id);


const notebookArtifactsData = await FileAttachment("../data/notebook-artifacts.json").json();
const notebookArtifacts = notebookArtifactsData[period] ?? [];


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
   
  return html.fragment`<details class="break-inside-avoid-column">
      <summary>AI nápověda</summary>
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

  const artifacts = notebookArtifacts.filter(a => a.id == id)  
  
  return html.fragment`
  ${mdPlus.unsafe(quiz.content([id], { ids, render: 'content' }), { docId: `${period}-${id}` })}
  ${renderButtons(quiz.content([id], { ids, render: 'content' }), values)}
  ${values?.length > 0 
  ? html.fragment`
  ${artifacts.map(a => html`<img src=${baseMediaPublic}/${period}/${a.fileName}.png />`)}
  ${values.map(([key, value]) => html`<div class="card break-inside-avoid-column">
  ${value.deductionTree != null ? html`<div>
  <div class="h-stack">
    <div style="flex:1">${key}</div>
  </div>
  ${renderChat(value.deductionTree)}
  </div>` : ''}  
</div>`)}
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

```
<style>
details.solutions > summary > h1, h2 {
    display:inline-block;
}
</style>

```js
display(html`<div class=root>${output}</div>`)
```

## AI nastavení

${selectedProviderInput}
<div class="h-stack h-stack--m h-stack--wrap">
</div>

