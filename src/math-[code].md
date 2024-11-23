---
sidebar: true
footer: false
pager: true
toc: false
---
<style>
  details.solution {
    display:flex;
    flex-direction:column;
    /* margin: 0 auto; */
    /* background: var(--theme-background-alt); */
    box-shadow: 0 .1rem 1rem -.5rem rgba(0,0,0,.4);
    /* border-radius: 5px; */
  
  }

  summary.solution {
    background: var(--theme-background-alt);
    border: solid 1px var(--theme-foreground-faintest);
    /* border-radius: 0.75rem; */
    padding: 1rem;
    /* margin: 1rem 0; */
    font: 14px var(--sans-serif);
  }

  details.solution[open]::details-content {
    border: solid 1px var(--theme-foreground-faintest);
    padding: 0.5rem;
  }

</style>
```js
import mdPlus from './utils/md-utils.js';

import { isEmptyOrWhiteSpace } from './utils/string-utils.js';
import { formatCode } from './utils/quiz-string-utils.js';
const metadata = await FileAttachment(`./data/math-${observable.params.code}.json`).json();
const entries = Object.entries(metadata);
function normalizeMath(value){
  if (value.match(/\$\$(\s+)\$\$/g)){
    console.log(value, value.replace(/\$\$/g, '\n\$\$\$\n'));
  }
  return value
    .replace(/±/g, `\\pm`)
    .replace(/\$\$(\s+)\$\$/g, '$$$\n$$$');
}
function renderResult(key, {Name, Answer, TemplateSteps}){
  return html`<div>
  <h3>${Name}</h3>
  <div class="card">
    ${mdPlus.unsafe(normalizeMath(Answer))}
  </div>
  <div class="v-stack v-stack--m">${TemplateSteps.map((d,i) => 
    html`<div class="v-stack v-stack--s">
      <video src="./assets/math/${observable.params.code}/${key}-${i}.mp4" autoplay playsinline muted controls></video>
      ${renderTemplateSteps(d)}
      
    </div>`)}</div>
  </div>`
}
function renderTemplateSteps({Name, Steps}){
  return html`<details class="solution">
  <summary class="solution" >${Name}</summary>
  <div class="grid grid-cols-2" style="grid-auto-rows: auto;">
    ${Steps.map((d,i) => renderStep(d,i))}
  </div>
  </details>`
}

function renderStep({Step, Hint, Expression}, index){
  return html`<div class="card">  
  <div class="h-stack h-stack--m"><span style="font-size:60px">${index + 1}</span>${mdPlus.unsafe(normalizeMath(Step))}</div>  
  <div>${mdPlus.unsafe(normalizeMath(Expression))}</div>
  ${!isEmptyOrWhiteSpace(Hint) ? html`<div class="tip">${Hint}</div>`:''}
  </div>`
}
```
# ${formatCode(observable.params.code)}

```js
html`${entries.map(([key, value]) => html`<div>
  <h2>${mdPlus.unsafe(normalizeMath(value.header))}</h2>
  ${mdPlus.unsafe(normalizeMath(`$${value.mathContent}$`))}
  ${(value.results ?? []).map(d =>  renderResult(key, d))}
</div><hr/>` )}`
```