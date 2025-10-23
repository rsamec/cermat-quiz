import { parseArgs } from "node:util";
import { parseQuiz } from './utils/quiz-parser.js';
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, formatCodeAlt, text } from './utils/quiz-string-utils.js';
import wordProblems, { } from './math/word-problems.js';
import { jsonToMarkdownChat } from "./utils/deduce-utils.js";
//import mdPlus from './utils/md-utils.js';
import Fraction from 'fraction.js';
const mdFormatting = {
  formatRatio: (d, asPercent) => asPercent ? `${(d * 100).toLocaleString("cs-CZ")}%` : new Fraction(d).toFraction(),
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
process.stdout.write(`---
title: ${formatCodeAlt(code)}
source: české statní zkoušky
toc: false
---


Heslovitý strukturovaný postup řešení úlohy je instrukcí pro AI, jak přeformulovat postup řešení do vhodné srozumitelnější podoby.

Proč nestačí poslat jen zadání úlohy? 
- přesnější instrukce, bohatší context -> kvalitnější výstup
- AI = **statistické rozpoznávání vzorů** - využijeme této silné stránky AI, a nepředstíráme, že **AI vymýšlí řešení** - to v principu neumí


<div class="tip" label="Didaktika">
Specifikujte ve vybraném nástroji jaký výsledek očekáváte

- **dle obsahu** - stručné, do hloubky, začátečník, pokročilý, atd.
- **dle formy** - video, audio, text, atd.

Doporučujeme sestavovat prompt podle následujích doporučení. <a href="https://cloud.google.com/solutions/learnlm?hl=en" target="_blank">Prompt guide</a>
</div>

<a download class="h-stack h-stack--s" href="/data/raw-${code}.md"  title="Řešení slovních úloh"><i class="fa fa-download"></i><span>stáhnout</span><a>

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