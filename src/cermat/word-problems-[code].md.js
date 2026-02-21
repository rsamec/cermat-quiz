import { parseArgs } from "node:util";
import { parseQuiz } from '../utils/quiz-parser.js';
import { normalizeImageUrlsToAbsoluteUrls } from '../utils/quiz-string-utils.js';
import wordProblems, { } from './word-problems.js';
import { jsonToMarkdownChat } from "../utils/deduce-utils.js";
import { formatCode, relativeBaseUrl } from './utils.js'
import path from 'path';
import { readTextFromFile } from "../utils/file.utils.js";


const {
  values: { code }
} = parseArgs({
  options: { code: { type: "string" } }
});


const ctEduPath = path.resolve(`./src/cermat`);
const content = await readTextFromFile(path.resolve(ctEduPath, `${code}/index.md`));        

// const rawContent = content;
const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [`${relativeBaseUrl}/${code}`])
const quiz = parseQuiz(rawContent);

const ids = quiz.questions.map(d => d.id);

const wordProblem = wordProblems[code];
process.stdout.write(`---
title: ${formatCode(code)}
source: Cermat
toc: false
---

Heslovitý **strukturovaný postup** řešení úlohy je **instrukcí** pro AI, jak přeformulovat postup řešení do vhodné **srozumitelnější podoby**.

<div class="tip" label="Upravit na míru požadavkům">

- Markdown je textový formát, který umožňuje snadnou úpravu.
- Specifikujte ve vybraném nástroji jaký výsledek očekáváte
  - **dle obsahu** - stručné, do hloubky, začátečník, pokročilý, atd.
  - **dle formy** - video, audio, text, atd.
  - **dle stylu** - formální, neformální, přátelský, odborný, atd.
  - **dle délky** - krátký, střední, dlouhý, atd.
  - **dle jazyka** - český, anglický, atd.

Doporučení pro vytvoření efektivního promptu pro AI. <a href="https://cloud.google.com/solutions/learnlm?hl=en" target="_blank">Prompt guide</a>
</div>

<a download class="h-stack h-stack--s" href="/cermat/word-problems-${code}.md"  title="Řešení slovních úloh"><i class="fa fa-download"></i><span>stáhnout</span><a>

## Náhled
\`\`\`md
${ids.map(id => {
  const values = (wordProblem?.[id] != null)
    ? [[id, wordProblem[id]]]
    : [1, 2, 3, 4]
      .map(i => `${id}.${i}`)
      .map(subId => wordProblem?.[subId])
      .filter(Boolean)
      .map((d, index) => [`${id}.${index + 1}`, d])


  return values?.length > 0 ? `
${quiz.content([id], { ids, render: 'content' })}\n
---
${values.map(([key, value]) =>
    `**${key} Rozbor řešení úlohy** \n
${jsonToMarkdownChat(value.deductionTree).join("")}`).join("")} \n---` : ''
}).join('')}
\`\`\`
`)