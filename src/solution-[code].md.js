import { parseArgs } from "node:util";
import path from 'path';
import mdPlus from './utils/md-utils.js';
import { parseQuiz } from './utils/quiz-parser.js';
import {readJsonFromFile} from './utils/file.utils.js';
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, formatCode, text, isEmptyOrWhiteSpace} from './utils/quiz-string-utils.js';

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


const merge = (f,s) => {
  return Object.keys(s).reduce((merged, key) => {
    merged[key] = {...f[key], ...s[key]}
    return merged;
  }, {...f})
}
const expressions = await readJsonFromFile(path.resolve('./src/data/math-answers.json'))
const geometry = await readJsonFromFile(path.resolve('./src/data/math-geometry.json'))

const result = Object.keys(geometry).reduce((merged, key) => {
  merged[key] = merge(expressions[key],geometry[key])
  return merged;
}, {...expressions})



const answers = result[code];
const ids = quiz.questions.map(d => d.id);

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
details.solutions > summary > h1, h2 {
    display:inline-block;
}
</style>
${answers == null ? `<div class="warning" label="Upozornění">
  K tomuto testu v tuto chvíli neexistují žádná řešení.
</div>`:''}
<div class="root">${ids.map(id => {
  const values = answers[id] != null ? [[id,answers[id]]]: [1,2,3].map(i => answers?.[`${id}.${i}`]).filter(Boolean).map((d,index) => [`${id}.${index + 1}`, d])


  return `${mdPlus.renderToString(quiz.content([id],{ ids, render:'content'}), {docId:`${code}-${id}` })}
${values?.length > 0 
? `<details class="solutions" open>
<summary><h2 style="flex:1;" id="s-${id}">Řešení úloha ${id}</h2></summary>
${values.map(([key,value]) => `<div class="card break-inside-avoid-column">
${(value.results ?? []).map(d =>  renderResult(key, d)).join('')}
</div>`).join("")}
</details>`:''}
`}).join('')}`)



function normalizeMath(value){
  return value
    .replace(/±/g, `\\pm`)
    .replace(/\$\$(\s+)\$\$/g, '$$$\n$$$');
}
function renderResult(key, {Name, Answer, TemplateSteps}){
  return `<h3>${Name}</h3>
  ${Answer != null ? `<div class="card">
    ${mdPlus.renderToString(normalizeMath(Answer))}
  </div>`:''}
<div class="v-stack v-stack--m">${TemplateSteps.map((d,i) => 
`<div class="v-stack v-stack--s">
<video src="./assets/math/${code}/${key}-${i}.mp4" playsinline muted controls></video>
${d.Steps?.length > 0 ? renderTemplateSteps(d):''}
</div>`).join("")}
</div>`
}
function renderTemplateSteps({Name, Steps}){
  return `<details class="solution">
  <summary class="solution" >${Name}</summary>
  <div class="grid grid-cols-1" style="grid-auto-rows: auto;">
    ${Steps.map((d,i) => renderStep(d,i)).join("")}
  </div>
  </details>`
}

function renderStep({Step, Hint, Expression}, index){
  return `<div class="card">
  <div class="h-stack h-stack--m"><span style="font-size:60px">${index + 1}</span>${mdPlus.renderToString(normalizeMath(Step))}</div>  
  <div>${mdPlus.renderToString(normalizeMath(Expression))}</div>
  ${!isEmptyOrWhiteSpace(Hint) ? `<div class="tip">${Hint}</div>`:''}
  </div>`
}
