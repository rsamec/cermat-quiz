import { parseArgs } from "node:util";
import path from 'path';
import mdPlus from './utils/md-utils.js';
import { parseQuiz } from './utils/quiz-parser.js';
import {readJsonFromFile} from './utils/file.utils.js';
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, formatCode, text, normalizeLatex } from './utils/quiz-string-utils.js';

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

const filePath = path.resolve('./src/data/quiz-answers-detail-gpt-4o.json');
const data = await readJsonFromFile(filePath);
const answers = data[code];
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


details.solutions > summary > h1, h2 {
    display:inline-block;
}
</style>
<div class="caution" label="Řešení může obsahovat chyby">
  Generováno pomocí AI. Doporučujeme kontrolovat důležité informace.
</div>
${answers == null ? ` <div class="warning" label="Upozornění">
  K tomuto testu v tuto chvíli neexistují žádná řešení.
</div>`:''}
<div class="root">${ids.map(id => `
${mdPlus.renderToString(quiz.content([id],{ ids, render:'content'}), {docId:`${code}-${id}` })}

${answers != null ? `
<details class="solutions" open>
<summary><h2 style="flex:1;" id="s-${id}">Řešení úloha ${id}</h2></summary>
<div class="card break-inside-avoid-column">
<div class="h-stack h-stack--end"><div class="badge badge--danger">Neověřeno</div></div>
${answers[id] != null ? mdPlus.renderToString(normalizeLatex(answers[id])): 'N/A'}
</div></details>`:''}
`).join('')}
</div>`)