import { parseArgs } from "node:util";
import { parseQuiz } from './utils/quiz-parser.js';
import mdPlus from './utils/md-utils.js';
import { parseCode, normalizeImageUrlsToAbsoluteUrls } from "./utils/quiz-utils.js";

const {
  values: { code }
} = parseArgs({
  options: { code: { type: "string" } }
});


async function text(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return await response.text();
}
const d = parseCode(code);
const baseUrl = `https://www.eforms.cz/${d.subject}/${d.period}/${code}`
const content = await text(`${baseUrl}/index.md`);


const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [baseUrl])
const quiz = parseQuiz(rawContent);

const ids = quiz.questions.map(d => d.id);
process.stdout.write(`---
title: Print quiz
theme: ["wide"]
sidebar: false
header: false
footer: false
pager: false
toc: true
style: /assets/css/print.css
---

<div data-testid="root" class="root">${ids.map(id => `${mdPlus.renderToString(quiz.content([id],{ ids, render:'content'}), {docId:`${code}-${id}` })}`).join('')}</div>`)