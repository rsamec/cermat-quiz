---
title: Testová zadání
footer: false
pager: true
toc: true
---

## Vstupy

```js
import { baseDomain, baseDomainPublic, formatSubject, formatPeriod, formatShortCode} from './utils/quiz-string-utils.js';
import { quizes } from "./utils/quiz-utils.js";
```

${quizes.map(({subject, period, codes}) => html`<h3>${formatSubject(subject)} ${formatPeriod(period)}</h3> <ul>${
  codes.map(code => html`<li>${formatShortCode(code)}<ul><li><a class="h-stack h-stack--s h-stack-items--center" href="${baseDomainPublic}/${subject}/${period}/${code}/index.md"><i class="fa-brands fa-markdown"></i>testové zadání</a></li><li><a class="h-stack h-stack--s h-stack-items--center" href="${baseDomain}/generated/${code}.json"><i class="fa-brands fa-js"></i>metadata</a></li></ul></li>`
)}</ul>`)}
