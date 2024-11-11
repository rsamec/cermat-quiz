import { parseArgs } from "node:util";
import { parseQuiz } from './utils/quiz-parser.js';
import  mdPlus from './utils/md-utils.js';
import { baseDomainPublic, parseCode, normalizeImageUrlsToAbsoluteUrls, formatCode } from './utils/quiz-string-utils.js';
import { layoutGenerator } from "./utils/markpress.utils.js";

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
const baseUrl = `${baseDomainPublic}/${d.subject}/${d.period}/${code}`
const content = await text(`${baseUrl}/index.md`);


const rawContent = normalizeImageUrlsToAbsoluteUrls(content, [baseUrl])
const quiz = parseQuiz(rawContent);

const ids = quiz.questions.map(d => d.id);
process.stdout.write(`---
title: ${formatCode(code)}
theme: ["wide"]
sidebar: false
header: false
footer: false
pager: false
toc: false
style: /assets/css/impress.css
---

<div id="impress">
    ${ids.map(id => `<div class='step' ${layoutGenerator["random-7d"]().map(d => `data-${d.key}="${d.value}"`).join(' ')}>${mdPlus.renderToString(quiz.content([id],{ ids, render:'content'}), {docId:`${code}-${id}` })}</div>`).join('')}
</div>

<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/impress/impress.js@2.0.0/js/impress.js"></script>
<script>impress().init()</script>

`);
