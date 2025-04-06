import { parseArgs } from "node:util";
import path from 'path';
import { parseQuiz } from './utils/quiz-parser.js';
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, formatCodeAlt, text, normalizeLatex } from './utils/quiz-string-utils.js';
import mdPlus from './utils/md-utils.js';
import { readJsonFromFile } from './utils/file.utils.js';

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

const aiAnswersData = await readJsonFromFile(path.resolve(`./src/data/word-problems-ai-${code}.json`));
const aiAnswers = aiAnswersData ?? {};

process.stdout.write(`---
title: ${formatCodeAlt(code)}
source: české statní zkoušky
toc: true
style: /assets/css/print-solution.css
---

${ids.filter(id => aiAnswers[id] != null).map(id => {
  
return `${quiz.content([id], { ids, render: 'content' })}\n-
---
**${id} Rozbor řešení úlohy** \n
${aiAnswers[id]}`
}).join('')}`)