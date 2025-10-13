---
sidebar: false
footer: false
pager: false
toc: false
---

```js

import { parseCode, formatCodeAlt, text } from './utils/quiz-string-utils.js';
import mdPlus from './utils/md-utils.js';

const content = await FileAttachment(`./data/raw-${observable.params.code}.md`).text()

```
${mdPlus.unsafe(content)}
