---
title: Quiz utils
theme: ["wide"]
sidebar: true
header: false
footer: false
pager: false
toc: false
---

```js
import {convertTree, formatSubject, formatPeriod, parseCode, formatCode, categories} from './utils/quiz-utils.js';

const subjects = ["math","cz"].flatMap(subject => ["4","6","8"].map(period => ({subject, period}))).concat(["cz", "en","de"].map(subject => ({subject,period:'diploma'})));


display(html`<ul>${subjects.map(d => html`<li><a href="./quiz-${d.subject}-${d.period}">${formatSubject(d.subject)}-${formatPeriod(d.period)}</a></li>`)}</ul>`)
```