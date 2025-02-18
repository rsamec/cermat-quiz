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
          return renderStep(row,steps$,addStep,answers$, steps.length)
        }
      )}
    </div>`
}

function renderStep({premises, conclusion, questions, index}, steps$, addStep, answers$, stepsCount){
  
  const q = questions[0];
  const options = shuffle(q?.options ?? [{tex:'Další krok', ok: true}]);
  const qInput = Inputs.button(options.map(d => ([d.tex,value => {
    if (d.ok) {
      addStep();
    }
    const res = answers$.value = [...answers$.value.slice(0, index),d];
    return res;
    }])),{value: 0});
    

  return rhtml`<div class="messages">
    <div class='message v-stack'>${premises.map(d => d)}</div>
    <div class='message agent v-stack'>
      ${q != null ? q.question:''}
      <div class=${computed(() => steps$.value.length === index + 1 ? '':'hidden')}>${qInput}</div>
      ${options.map(d => rhtml`<span class=${computed(() => answers$.value[index] === d && d.result != null ? (d.ok ? 'badge badge--success': 'badge badge--danger') : 'hidden')} style="align-self:flex-start;">${d.tex} = ${d.result}</span>`)}
    </div>
    ${computed(() => stepsCount == index + 1 && answers$.value[index]?.ok === true ? rhtml`<div class="message">${conclusion}</div>`:'')}
  </div>
  `
}

function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

export function useInput(input){
  const s = signal(input.value);

  // Update the signal on input events from the range slider
  const changed = (e) => (s.value = input.value);
  
  input.addEventListener("input", changed);
  //invalidation.then(() => input.removeEventListener("input", changed));
  return s;
}
