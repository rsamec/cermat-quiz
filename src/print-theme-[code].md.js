import { parseArgs } from "node:util";
import { parseQuiz } from './utils/quiz-parser.js';
import mdPlus from './utils/md-utils.js';
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, formatCode, text } from './utils/quiz-string-utils.js';

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
const groupKeyMap = new Map(quiz.questions.map(d => [d.id,d.groupKey]))
process.stdout.write(`---
title: ${formatCode(code)}
theme: ["wide"]
sidebar: false
header: false
footer: false
pager: false
toc: false
style: /assets/css/print-color.css
---

<div data-testid="root" class="root">${ids.map(id => `<div class="break-inside-avoid-column q group-${groupKeyMap.get(id)}">${mdPlus.renderToString(quiz.content([id],{ ids, render:'content'}), {docId:`${code}-${id}` })}</div>`).join('')}</div>`)