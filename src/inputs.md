---
title: Data
footer: false
pager: true
toc: true
---
```js
import { baseDomain, baseDomainPublic, formatSubject, formatPeriod, formatShortCode} from './utils/quiz-string-utils.js';
import { quizes } from "./utils/quiz-utils.js";
```

# Datové formáty

Banka úloh výchází z oficiálních cermat úloh. Použité formáty dat k testovým úlohám.
- markdown - testové zadání
- json - meta data - klíč správných řešení, body, atd...

Podrobnosti k datovým formátům jsou uvedeny [https://github.com/rsamec/cermat](https://github.com/rsamec/cermat).

Tato data vznikla na základě oficiálních CERMAT materiálů a pro jejich využití je nutné dodržet ['CERMAT' license](https://prijimacky.cermat.cz/files/files/CZVV_pravidla-vyuziti-webstrankyn.pdf).

## Seznam dat v bance úloh

${quizes.map(({subject, period, codes}) => html`<h3>${formatSubject(subject)} ${formatPeriod(period)}</h3> <ul>${
  codes.map(code => html`<li>${formatShortCode(code)}<ul><li><a class="h-stack h-stack--s h-stack-items--center" href="${baseDomainPublic}/${subject}/${period}/${code}/index.md"><i class="fa-brands fa-markdown"></i>testové zadání</a></li><li><a class="h-stack h-stack--s h-stack-items--center" href="${baseDomain}/generated/${code}.json"><i class="fa-brands fa-js"></i>metadata</a></li></ul></li>`
)}</ul>`)}
