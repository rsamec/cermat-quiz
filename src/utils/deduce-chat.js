import { html as rhtml, forEach } from './reactive-htl.js';
import { signal, computed } from '@preact/signals-core';
import {stepsTraverse} from './deduce-components.js';
import * as Inputs from 'npm:@observablehq/inputs';


export function renderChatStepper(deductionTree){
  const steps = stepsTraverse(deductionTree).map((d,i) => ({...d, index:i}));
  
  const answers$ = signal([]);
  const steps$ = signal([]);
  const addStep = () => {
    steps$.value = steps$.value.length <= steps.length ? steps.slice(0, steps$.value.length + 1): steps;
  }
  addStep();

  return rhtml`<div class="chat">
      ${forEach(computed(() => steps$.value),(row,i) => {
        let rowId = row.id;
        return rhtml`<div>
          ${computed(() => renderStep(row,steps$,addStep,answers$, steps$.value.length))}
        <div>`
        }
      )}
    </div>`
}

function renderStep({premises, conclusion, questions, index}, steps$, addStep, answers$, stepsCount){
  const q = questions[0];
  const options = q?.options ?? [{tex:'Dále', ok: 1}];
  const qInput = Inputs.button(options.map(d => ([d.tex,value => {
    if (d.ok) {
      addStep();
    }
    return answers$.value = [...answers$.value.slice(0, index),d];
    }])),{value: 0});
    

  return rhtml`<div class="messages">
    <div class='message v-stack'>${premises.map(d => d)}</div>
    <div class='message agent'>
      ${q != null ? q.question:''}
      <div class="${computed(() => steps$.value.length === index + 1 ? '':'hidden')}">${qInput}</div>
      ${options.map(d => rhtml`<div class="badge ${computed(() => answers$.value[index] === d ? (d.ok ? 'badge--success': 'badge--danger') : 'hidden')}">${d.tex} = ${d.result}</div>`)}
    </div>
  </div>
  `
}