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