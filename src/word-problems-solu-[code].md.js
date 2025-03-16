import { parseArgs } from "node:util";
import { parseQuiz } from './utils/quiz-parser.js';
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, formatCode, text } from './utils/quiz-string-utils.js';
import wordProblems, {  } from './math/word-problems.js';
import { jsonToMarkdownChat } from "./utils/deduce-utils.js";
//import mdPlus from './utils/md-utils.js';

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

const ids = quiz.questions.map(d => d.id);

const wordProblem = wordProblems[code];

process.stdout.write(`---
title: ${formatCode(code)}
sidebar: true
header: ${formatCode(code)}
footer: false
pager: true
toc: true
style: /assets/css/print-solution.css
---

${ids.map(id => {
  const values = (wordProblem?.[id] != null)
    ? [[id, wordProblem[id]]]
    : [1, 2, 3]
      .map(i => `${id}.${i}`)
      .map(subId => wordProblem?.[subId])
      .filter(Boolean)
      .map((d, index) => [`${id}.${index + 1}`, d])


  return `
${values?.length > 0 ? 
`${quiz.content([id], { ids, render: 'content' })}\n
---
${values.map(([key, value]) => 
`**${key} Rozbor řešení úlohy** \n
${jsonToMarkdownChat(value.deductionTree).join("")}`).join("")} \n`
      : ''}
`}).join('')}`)