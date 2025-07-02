---
title: Matematika - slovní úlohy
footer: false
pager: true
toc: true
style: /assets/css/math-deduce.css
---

```js
import mdPlus from './utils/md-utils.js';
import pako from 'pako';
import { parseQuiz } from './utils/quiz-parser.js';
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, formatCode, text, isEmptyOrWhiteSpace } from './utils/quiz-string-utils.js';
import wordProblems from './math/word-problems.js';
import {partion, relativeTowParts, relativeTwoPartsDiff, deduceTraverse, highlightLabel, renderChat } from './utils/deduce-components.js';
import { renderChatStepper, useInput } from './utils/deduce-chat.js';
import {isPredicate, computeTreeMetrics, jsonToMarkdownTree, jsonToMermaidMindMap, jsonToMarkdownChat, highlight, generateAIMessages} from './utils/deduce-utils.js';
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
  return html`<a style="height:34px;" href="https://chat.openai.com/?q=${encodeURIComponent(query)}" target="_blank"><img style="height:34px;" src="https://img.shields.io/badge/chatGPT-74aa9c?style=for-the-badge&logo=openai&logoColor=white&label=${encodeURIComponent(label)}" alt="ChatGPT" /></a>`
}

function renderAudio(code,id) {
  return html`<audio src="./assets/math/${code}/${id}.mp3" autoplay playsinline muted controls style="min-width: 100px;"></audio>`
}
function renderQuestion(id) {
  return html`${mdPlus.unsafe(quiz.content([id]))}`
}
function renderMarkdownWithCopy(content, lang){
  return html`<div class="observablehq-pre-container" data-language="${lang}">
  <button title="Copy code" class="observablehq-pre-copy" onclick=${() => navigator.clipboard.writeText(content)}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 6C2 5.44772 2.44772 5 3 5H10C10.5523 5 11 5.44772 11 6V13C11 13.5523 10.5523 14 10 14H3C2.44772 14 2 13.5523 2 13V6Z M4 2.00004L12 2.00001C13.1046 2 14 2.89544 14 4.00001V12"></path></svg></button>
  <div style="padding: 0px 20px">
  ${mdPlus.unsafe(content)}
  </div>
  </div>`
}
function renderAsCodeBlock(value, lang) {
    return html`<div class="observablehq-pre-container" data-language="${lang}">
    <button title="Copy code" class="observablehq-pre-copy" onclick=${() => navigator.clipboard.writeText(value)}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 6C2 5.44772 2.44772 5 3 5H10C10.5523 5 11 5.44772 11 6V13C11 13.5523 10.5523 14 10 14H3C2.44772 14 2 13.5523 2 13V6Z M4 2.00004L12 2.00001C13.1046 2 14 2.89544 14 4.00001V12"></path></svg></button>
    <pre data-language="${lang}"><code class="language-${lang}">${value}</code></pre>
    </div>`
} 
function toBase64Url(bytes) {
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  function createMermaidEditorUrl(mermaidCode, mode = 'edit') {
    const state = {
      code: mermaidCode,
      mermaid: { theme: "default" },
      autoSync: true,
      updateDiagram: true
    };

    const json = JSON.stringify(state);
    const compressed = pako.deflate(json, { level: 9 });
    const encoded = toBase64Url(compressed);

    return `https://mermaid.live/${mode}#pako:${encoded}`;
  }


// function renderMermaid(content, lang){
//   const promise = mermaidPlus.unsafe(`${content}`);
//   return Generators.observe((notify) => {
//       promise.then((value) => notify(value));
//       notify('Diagraming...');
//     return () => {};
//   });  
// }
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
  return values.map(([key, value], i) => {
    const {depth, width, predicates} = computeTreeMetrics(value.deductionTree);
    return html.fragment`  
  <h3>Řešení ${key}</h3>
  <div class="h-stack h-stack--l h-stack--wrap">
    <div class="h-stack h-stack--m h-stack--wrap">
      <div class="badge">Hloubka: ${depth}</div>
      <div class="badge">Šířka: ${width}</div>
    </div>
    <div class="h-stack h-stack--m h-stack-items--center">
      <span>Predikáty:</span>
      <div class="h-stack h-stack--s h-stack--wrap">
        ${predicates.map(d => html`<div class="badge">${d}</div>`)}
      </div>
    </div>
  </div>
  
  <details>
    <summary>Video</summary>
    <video src="./assets/math/${code}/${key}-0.mp4" playsinline muted controls style="width: 100%;"></video>
  </details>

  <details open>
    <summary>Chat</summary>

    <div class="card">
    ${renderChat(value.deductionTree)}
    </div>
  </details>

  <details>
    <summary>Rozhodovačka</summary>
    <div class="card">
      ${renderChatStepper(value.deductionTree)}
    </div>  
  </details>

  <details>
    <summary>Strom</summary>
    <div class="card">
      ${deduceTraverse(value.deductionTree)}
    </div>
  </details>

  <details>
    <summary>Strom - textově</summary>
    <div class="card">
      ${renderMarkdownWithCopy(jsonToMarkdownTree(value.deductionTree).join(''), "md")}
    </div>
  </details>
  <details>
    <summary>Chat - textově</summary>
    <div class="card">
      ${renderMarkdownWithCopy(jsonToMarkdownChat(value.deductionTree).join(''), "md")}
    </div>
  </details>
  <details>
    <summary>Mind map</summary>
    <a href="${createMermaidEditorUrl(jsonToMermaidMindMap(value.deductionTree).join(''),'edit')}" target="_blank">Edit</a>
    <div class="card">
      ${renderAsCodeBlock(jsonToMermaidMindMap(value.deductionTree).join(''), "mermaid")}
    </div>
    
  </details>
  <hr/>
`})
}

  
```
#

${renderQuestion(id)}

# AI řešení úlohy

<div class="tip" label="Smart řešení úlohy">  
  AI dostane kromě zadání úlohy i řešení úlohy rozpadnuté na základní jednoduché operace.
  AI následně upraví řešení tak, aby bylo co nejjasnější a nejpochopitelnější.
</div>


${renderChatButton("Základní řešení", template)}
${renderChatButton("Smart řešení", aiPromts.explainSolution)}
${renderChatButton("Hlavní myšlenky řešení", aiPromts.generateImportantPoints)}
${renderChatButton("Obdobné úlohy", aiPromts.generateMoreQuizes)}
${renderChatButton("Pracovní list", aiPromts.generateSubQuizes)}
${renderChatButton("Generalizace úlohy", aiPromts.generalization)}
${renderChatButton("Vizualizuj řešení", aiPromts.vizualizeSolution)}
${renderChatButton("Vizualizuj hlavní myšlenku", aiPromts.vizualizeImportantPoints)}

${values?.some(([key,value]) => value.audio) ? html`<div class="tip" label="Podcast">Poslechni si podcast vygenerovaný pro danou úlohu v anglickém jazyce. Generováno pomocí <a href="https://notebooklm.google/">NotebookLM</></div>${renderAudio(code,id)}`:''}

# Strukturované řešení úlohy

${renderValues(values)}