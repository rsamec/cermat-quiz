---
title: Výběr testu
sidebar: true,
pager: true
footer: false
toc: false
style: '/assets/css/quiz-picker.css'
---

```js
import { quizes } from '../utils/quiz-utils.js';
import { formatPeriod} from './utils.js'
const ctEduFolders = await FileAttachment("../ctedu/folders.json").json();

```

<!-- Cards with big numbers -->

<div class="grid grid-cols-4">
 ${[2026].map((year) => html`<div class="card">
    <div class="v-stack v-stack--l">
    <div class="v-stack v-stack--s">
      <div>
        <div class="big">${year}</div>
      </div>
      <div class="v-stack v-stack--l">
        ${ctEduFolders.map(period => html`<div class="h-stack h-stack--m h-stack-items--center h-stack--wrap">
              <a class="h-stack h-stack--s" href="./solution-${period}"><i class="fas fa-money-check"></i><span>${formatPeriod(period)}</span></a>
              <a class="h-stack h-stack--s" href="./print-${period}"><i class="fa-solid fa-print"></i><span>tisk</span></a>            
              <a class="h-stack h-stack--s" href="./arch-${period}"><i class="fa-solid fa-key"></i><span>klíč</span></a>            
          <div>`
        )}
      </div>
    </div>
  </div>`
  )}
</div>

## Balíček dat ke stažení

Balíček **všech zadání úloh** ve formátu markdown členěno dle granularity až na úroveň

- <a download class="h-stack h-stack--s  h-stack-items--center" href="/ctedu/questions.zip"><i class="fa fa-brands fa-markdown"></i><span>jednotlivých testů</span></a>
- <a download class="h-stack h-stack--s  h-stack-items--center" href="/ctedu/question.zip"><i class="fa fa-brands fa-markdown"></i><span>jednotlivých úloh</span></a>

Balíček **úloh s postupy řešení úloh** ve formátu markdown členěno dle granularity až na úroveň
- <a download class="h-stack h-stack--s  h-stack-items--center" href="/ctedu/word-problems.zip"><i class="fa fa-brands fa-markdown"></i><span>jednotlivých testů</span></a>
- <a download class="h-stack h-stack--s  h-stack-items--center" href="/ctedu/word-problem.zip"><i class="fa fa-brands fa-markdown"></i><span>jednotlivých úloh</span></a>



