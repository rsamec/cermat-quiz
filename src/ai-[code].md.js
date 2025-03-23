import { parseArgs } from "node:util";
import path from 'path';
import mdPlus from './utils/md-utils.js';
import { parseQuiz } from './utils/quiz-parser.js';
import {readJsonFromFile} from './utils/file.utils.js';
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, formatCode, text, normalizeLatex } from './utils/quiz-string-utils.js';
import wordProblems from './math/word-problems.js';
import {generateAIMessages} from './utils/deduce-utils.js'
const {
  values: { code }
} = parseArgs({
  options: { code: { type: "string" } }
});

const d = parseCode(code);
const baseUrl = `${baseDomainPublic}/${d.subject}/${d.period}/${code}`
const content = await text(`${baseUrl}/index.md`);


const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [baseUrl])
const quiz = parseQuiz(rawContent);

const filePath = path.resolve('./src/data/quiz-answers-detail-o1-mini.json');
const data = await readJsonFromFile(filePath);
const answers = data[code];
const ids = quiz.questions.map(d => d.id);

const wordProblem = wordProblems[code];


process.stdout.write(`---
title: ${formatCode(code)}
sidebar: true
header: ${formatCode(code)}
footer: false
pager: true
toc: true
style: /assets/css/print.css
---
<style>
.badge {
  border-radius: 16px;
  padding: 0px 8px;
  font-weight: 900;
  background-color: var(--theme-foreground);
  color: var(--theme-background);
}
.badge--danger {
    background-color: color-mix(in srgb, var(--theme-red), var(--theme-background) 90%);
    color: var(--theme-red);
  }

.katex-display > .katex {
  display: inline-block;
  white-space: nowrap;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: auto;
  padding: 7px 0px;
  text-align: initial;
}

details.solutions > summary > h1, h2 {
    display:inline-block;
}
</style>
<div class="caution" label="Řešení může obsahovat chyby">
  Generováno pomocí AI. Doporučujeme kontrolovat důležité informace.
  <div class="h-stack h-stack--end"><small>o1-mini, poslední aktualizace: 9.2.2025</small></div>
</div>

${answers == null ? ` <div class="warning" label="Upozornění">
  K tomuto testu v tuto chvíli neexistují žádná řešení.
</div>`:''}

${wordProblem != null ? `<div class="tip" label="Tlačítko smart řešení úlohy">
  AI dostane kromě zadání úlohy i řešení úlohy rozpadnuté na základní jednoduché operace.
  AI následně upraví řešení tak, aby bylo co nejjasnější a nejpochopitelnější.
</div>
`:''}

<div class="root">${ids.map(id => {

const values = (wordProblem?.[id] != null)
      ? [[id, wordProblem[id]]]
      : [1, 2, 3]
        .map(i => `${id}.${i}`)
        .map(subId => wordProblem?.[subId])
        .filter(Boolean)
        .map((d, index) => [`${id}.${index + 1}`, d])

const template = quiz.content([id],{ ids, render:'content'});
const aiPrompts =  values?.length > 0 ? generateAIMessages({
  template,
  deductionTrees:values.map(([key, value]) => [`Řešení ${key}`,value.deductionTree])}): null;

  

return `
${mdPlus.renderToString(template, {docId:`${code}-${id}` })}

${answers != null ? `
<details class="solutions" open>
<summary><h2 style="flex:1;" id="s-${id}">Řešení úloha ${id}</h2></summary>
<div class="break-inside-avoid-column">
<div class="h-stack h-stack--end">${aiPrompts?.explainSolution != null ? renderChatButton("Smart řešení", aiPrompts.explainSolution) :''}</div>
<div class="card">
<div class="h-stack h-stack--end"><div class="badge badge--danger">Neověřeno</div></div>
${answers[id] != null ? mdPlus.renderToString(normalizeLatex(answers[id])): 'N/A'}
</div></details>`:''}
`}).join('')}
</div></div>`)



function renderChatButton(label, query){
  return `<a style="height:34px;" href="https://chat.openai.com/?q=${encodeURIComponent(query)}')"><img style="height:34px;" src="https://img.shields.io/badge/chatGPT-74aa9c?style=for-the-badge&logo=openai&logoColor=white&label=${encodeURIComponent(label)}" alt="ChatGPT" /></a>`
}