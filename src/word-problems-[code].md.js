import { parseArgs } from "node:util";
import { parseQuiz } from './utils/quiz-parser.js';
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, formatSubject, text } from './utils/quiz-string-utils.js';
import wordProblems, {  } from './math/word-problems.js';
import { jsonToMarkdownChat } from "./utils/deduce-utils.js";
//import mdPlus from './utils/md-utils.js';
import Fraction from 'fraction.js';
const mdFormatting = {
  formatRatio: (d,asPercent) => asPercent ? `${(d * 100).toLocaleString("cs-CZ")}%`  : new Fraction(d).toFraction(),
}

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
const formatTitle = code => {
  const {subject, year, grade} = parseCode(code);
  return `${formatSubject(subject)} ${grade}.ročník ${year}`
}
process.stdout.write(`---
title: ${formatTitle(code)}
source: české statní přijímací zkoušky
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
${quiz.content([id], { ids, render: 'content' })}\n
---
${values.map(([key, value]) => 
`**${key} Rozbor řešení úlohy** \n
${jsonToMarkdownChat(value.deductionTree, mdFormatting).join("")}`).join("")} \n
`}).join('')}`)