---
title: Matematika - slovní úlohy
footer: false
pager: true
toc: true
style: /assets/css/math-deduce.css
---

```js
import mdPlus from './utils/md-utils.js';
import { parseQuiz } from './utils/quiz-parser.js';
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, formatCode, text, isEmptyOrWhiteSpace } from './utils/quiz-string-utils.js';
import wordProblems from './math/word-problems.js';
import {partion, relativeParts, relativePartsDiff, deduceTraverse, highlightLabel, renderChat } from './utils/deduce-components.js';
import { renderChatStepper, useInput } from './utils/deduce-chat.js';
import {isPredicate, computeTreeMetrics, jsonToMarkdownTree, jsonToMarkdownChat, highlight, generateAIMessages} from './utils/deduce-utils.js';

import Fraction from 'fraction.js';

const code = observable.params.code;
const id = parseInt(observable.params.number, 10);
const d = parseCode(code);
const baseUrl = `${baseDomainPublic}/${d.subject}/${d.period}/${code}`
const content = await text(`${baseUrl}/index.md`);


const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [baseUrl])
const quiz = parseQuiz(rawContent);


const wordProblem = wordProblems[code] ?? {};
```

```js

function renderChatButton(label, query){
  return html`<a style="height:34px;" href="#" onclick=${(e) => {
                    e.preventDefault();
                    window.open(`https://chat.openai.com/?q=${encodeURIComponent(query)}`)
                  }}><img style="height:34px;" src="https://img.shields.io/badge/chatGPT-74aa9c?style=for-the-badge&logo=openai&logoColor=white&label=${encodeURIComponent(label)}" alt="ChatGPT" /></a>`
}

function renderAudio(code,id) {
  return html`<audio src="./assets/math/${code}/${id}.mp3" autoplay playsinline muted controls style="width: 100%;"></audio>`
}
function renderQuestion(id) {
  return html`${mdPlus.unsafe(quiz.content([id]))}`
}


const values = (wordProblem[id] != null)
   ? [[id, wordProblem[id]]] 
   : [1, 2, 3]
    .map(i => `${id}.${i}`)
    .map(subId => wordProblem[subId])
    .filter(Boolean)
    .map((d, index) => [`${id}.${index +1}`, d]);

const template = quiz.content([id]);
const aiPromts = generateAIMessages({
        template: quiz.content([id]),
        deductionTrees:values.map(([key, value]) => [`Řešení ${key}`,value.deductionTree])});

function renderValues (values) {
  return values.map(([key, value], i) => html.fragment`
  <h1>Řešení ${key}</h1>
  <div class="card">

  ${renderChat(value.deductionTree)}
  </div>
  <h2>Rozhodovačka</h2>

  <div class="card">

  ${renderChatStepper(value.deductionTree)}
  </div>

`)
}

  
```
#

${renderQuestion(id)}

# AI postupy řešení

<div class="tip" label="Smart řešení úlohy">  
  Je založen na tom, že AI nedostane pouze zadání úlohy, ale v rámci promptu dostane i řešení úlohy rozpadnuté na základní jednoduché operace.
  AI poté jen přeformuluje řešení do co nejsrozumitelnější podoby.
</div>


${renderChatButton("Základní postup řešení", template)}
${renderChatButton("Smart postup řešení", aiPromts.explainSolution)}
${renderChatButton("Generuj obdobné úlohy", aiPromts.generateMoreQuizes)}

<div class="tip" label="Smart podcast">
  Poslechni si podcast vygenerovaný pro danou úlohu v anglickém jazyku. Generováno pomocí <a href="https://notebooklm.google/">NotebookLM</>
</div>

${renderAudio(code,id)}


# Strukturované řešení úlohy


${values?.filter(([key, value]) =>  value.deductionTree != null).length > 0
      ? html.fragment`
      <div class="h-stack h-stack--wrap">
      <div>
        ${values.map(([key, value]) => html`<div>Řešení ${key}</div><video src="./assets/math/${code}/${key}-0.mp4" autoplay playsinline muted controls style="width: 100%;"></video>`)}
      </div>
    </div>`:''}



  ${renderValues(values)}

