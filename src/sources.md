---
title: Zdroje
sidebar: true,
pager: true
footer: false
toc: false
---

```js
import { formatShortCode, formatSubject, formatPeriod, formatVersion, parseCode } from './utils/quiz-string-utils.js';
import { quizes } from './utils/quiz-utils.js';
const filteredQuizes = quizes.filter(d => d.subject === "math").flatMap(d => d.codes);
const quizesByYear = Object.entries(Object.groupBy(filteredQuizes, (d) => parseCode(d).period));
```
## Zadání a postupy řešení slovních úloh

<div class="v-stack">
${quizesByYear.map(([period,codes]) => html`<h3>${formatPeriod(period)}</h3> <ul>${codes.map(code => {
  const {order,subject,period,year} = parseCode(code);
  return html`<li><a href="${code}" title="Řešení slovních úloh"><i class="fa fa-brands fa-markdown"></i> ${formatShortCode(code)}</a></li>`
})}</ul>`
)}
</div>