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

Databanka úloh výchází z oficiálních cermat úloh. Použité formáty dat k testovým úlohám.
- markdown - testové zadání
- json - meta data - klíč správných řešení, body, ...

<div class="caution" label="Pozor">
  Využití dat je limitováno doržením <a href="https://prijimacky.cermat.cz/files/files/CZVV_pravidla-vyuziti-webstrankyn.pdf">CERMAT licence</a>.
</div>
<div class="tip" label="Hlášení chyb">
  Databanka je spravována na <a href="https://github.com/rsamec/cermat"><i class="fa-brands fa-github"></i> github</a>.
  V případě že narazíte na chybu v úloze, opravte chybu svépomocí <a href="https://github.com/rsamec/cermat/pulls" target="_blank">PR</a> nebo nahlaste <a href="https://github.com/rsamec/cermat/issues">chybu</>.
</div>

## Seznam dat v bance úloh

${quizes.map(({subject, period, codes}) => html`<h3>${formatSubject(subject)} ${formatPeriod(period)}</h3> <ul>${
  codes.map(code => html`<li>${formatShortCode(code)}<ul><li><a class="h-stack h-stack--s h-stack-items--center" href="${baseDomainPublic}/${subject}/${period}/${code}/index.md"><i class="fa-brands fa-markdown"></i>testové zadání</a></li><li><a class="h-stack h-stack--s h-stack-items--center" href="${baseDomain}/generated/${code}.json"><i class="fa-brands fa-js"></i>metadata</a></li></ul></li>`
)}</ul>`)}


[Podrobnosti k datovým formátům](https://github.com/rsamec/cermat)