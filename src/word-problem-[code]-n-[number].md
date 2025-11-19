---
title: Matematika - slovní úlohy
footer: false
pager: true
toc: true
style: /assets/css/math-deduce.css
---

```js
import mdPlus from './utils/md-utils.js';
import { createMachine , createActor} from 'xstate';
import { parseQuiz } from './utils/quiz-parser.js';
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, formatCode, text, isEmptyOrWhiteSpace } from './utils/quiz-string-utils.js';
import wordProblems from './math/word-problems.js';
import {partion, relativeTowParts, relativeTwoPartsDiff, deduceTraverse, highlightLabel, renderChat } from './utils/deduce-components.js';
import { renderChatStepper, useInput } from './utils/deduce-chat.js';
import {isPredicate, computeTreeMetrics, jsonToMarkdownTree, jsonToMermaidMindMap, jsonToMarkdownChat, highlight, generateAIMessages, deductionTreeToHierarchy, formatPredicate} from './utils/deduce-utils.js';

import { convertTree, getAllLeafsWithAncestors } from './utils/parse-utils.js';
import { signal } from '@preact/signals-core';
import { extractAxiomsFromTree, getStepsFromTree } from "./utils/deduce-utils.js";
import { renderCalc } from "./calc/calc-component.js";
import { calcMachine, getNextEvents, getStateValueString, ArraySetMap } from './calc/calculator.js';

import Fraction from 'fraction.js';

const metadata = await FileAttachment(`./data/form-${observable.params.code}.json`).json();
const code = observable.params.code;
const leafs = getAllLeafsWithAncestors(convertTree(metadata));
const metadataMap = new Map(leafs.map(d => [d.leaf.data.id, d.leaf.data.node]));


const id = parseInt(observable.params.number, 10);
const d = parseCode(code);

let quiz = {
  content: () => ``
};

try {
  const baseUrl = `${baseDomainPublic}/${d.subject}/${d.period}/${code}`
  const content = await text(`${baseUrl}/index.md`);


  const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [baseUrl])
  quiz = parseQuiz(rawContent);
}
catch(ex){

}

const wordProblem = wordProblems[code] ?? {};

const providersConfig = [
  {name:"Open AI ChatGTP",shortName:"ChatGTP",url:"https://chat.openai.com/?temporary-chat=true&q="},
  {name:"Google AI Mode Gemini",shortName:"Gemini",url:"https://www.google.com/search?udm=50&q="},    
  {name:"Microsoft Copilot", shortName:"Copilot", url:"https://www.bing.com/search?showconv=1&sendquery=1&q="},
  {name:"Anthropic Claude", shortName:"Claude", url:"https://claude.ai/new?q="},  
  {name:"Mistral Le Chat", shortName:"Mistral", url:"https://chat.mistral.ai/chat?q="},  
]

const providers = new Map(providersConfig.map(d => [d.name, d]));
const selectedProviderInput = Inputs.select(providers,{ label:"Poskytovatel"});
const selectedProvider = Generators.input(selectedProviderInput);

```


```js

function createAndBindSignals({metadata, inferenceMap}){    
    const {verifyBy} = metadata;
    
    // Create an actor that you can send events to.
    // Note: the actor is not started yet!    
    const actor = createActor(calcMachine, {input: {verifyBy, inferenceMap}});
    actor.start();    
    
    const snapshot = actor.getSnapshot();
    const context$ = signal(snapshot.context);
    const currentState$ = signal(getStateValueString(snapshot));
    const nextEvents$ = signal(getNextEvents(snapshot));

    actor.subscribe({
        next: state => {
            context$.value = {...state.context};
            currentState$.value = getStateValueString(state);
            nextEvents$.value = getNextEvents(state);     
        }
    });
    return {context$, currentState$, nextEvents$, actor}
}


function renderChatButton(label, provider, query){
  return html`<a href="${provider.url}${encodeURIComponent(query)}" target="_blank"><button class="btn btn--dual h-stack"><div class="btn__left-part">${label}</div><div class="btn__right-part">${provider.shortName}<div/></button></a>`
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


const values = (wordProblem[id] != null)
   ? [[id, wordProblem[id]]] 
   : [1, 2, 3, 4]
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
    const metadata = metadataMap.get(key.toString());
    const steps = getStepsFromTree(value.deductionTree);
    const inferenceMap = new ArraySetMap(steps);
    const bindings = createAndBindSignals({metadata, inferenceMap})
        
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


  <details open>
    <summary>Kalkulačka</summary>
    <div class="card">
      ${html`<div class="calc-view">${renderCalc({
            ...bindings,
            axioms: extractAxiomsFromTree(value.deductionTree),    
            steps:steps.map(([premises, _conclusion]) => premises),
            key,
        })}`}
    </div>  
  </details>

  <details>
    <summary>Rozhodovačka</summary>
    <div class="card">
      ${renderChatStepper(value.deductionTree)}
    </div>  
  </details>

  <details>
    <summary>Chat</summary>

    <div class="card">
    ${renderChat(value.deductionTree)}
    </div>
  </details>

  <details>
    <summary>Chat - textově</summary>
    <div class="card">
      ${renderMarkdownWithCopy(jsonToMarkdownChat(value.deductionTree).join(''), "md")}
    </div>
  </details>

  <details>
    <summary>Strom</summary>
    <div>
      ${deduceTraverse(value.deductionTree)}
    </div>
  </details>

  <details>
    <summary>Strom - textově</summary>
    <div class="card">
      ${renderMarkdownWithCopy(jsonToMarkdownTree(value.deductionTree).join(''), "md")}
    </div>
  </details>
  ${false ? html`
  <details>
    <summary>Strom - json</summary>
    <div class="card">
      ${renderAsCodeBlock(JSON.stringify(deductionTreeToHierarchy(value.deductionTree, node => {
        return { 
          name:formatPredicate(node, {formatKind:(d) => d.kind ?? ''}),
        }
  }), null, 2), "json")}
    </div>    
  </details>`: ''}
  <hr/>
`})
}

  
```

${renderQuestion(id)}

## AI řešení

${selectedProviderInput}
<div class="h-stack h-stack--m h-stack--wrap">
${renderChatButton("Smyslupnost zadání", selectedProvider, aiPromts.realWorldExamples)}
${renderChatButton("Základní řešení",selectedProvider, template)}
${renderChatButton("Krokové řešení", selectedProvider, aiPromts.steps)}
${renderChatButton("Hlavní myšlenky",  selectedProvider, aiPromts.generateImportantPoints)}
${renderChatButton("Obdobné úlohy",  selectedProvider, aiPromts.generateMoreQuizes)}
${renderChatButton("Pracovní list", selectedProvider, aiPromts.generateSubQuizes)}
${renderChatButton("Generalizace", selectedProvider, aiPromts.generalization)}
</div>

---

## Strukturované řešení úlohy
```js
display(html`${renderValues(values)}`)
```