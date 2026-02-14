---
title: Záznamový arch, klíč řešení
footer: false
pager: true
toc: true
style: /assets/css/arch.css
---


```js
import { QuizStore } from '../utils/quiz-store.js';
import { formFromSchemaWithRefs } from '../utils/arch-inputs.js';

const metadata = await FileAttachment(`./${observable.params.code}/key.json`).json();
const schema = await FileAttachment(`./arch-${observable.params.code}.schema.json`).json();
```

```js
const personForm = formFromSchemaWithRefs(schema, {});
const person = Generators.input(personForm);

const showAnswersInput =  Inputs.toggle({label: "Zobrazit klíč řešení"})
const showAnswers = Generators.input(showAnswersInput);
```

```js
const store = new QuizStore({metadata});

const values = Generators.observe((notify) => {
  
  const inputted = (event, v) => {
      const value = personForm.value;
      store.submitQuiz(value)
      notify(store.getState())
  }
  personForm.addEventListener("input", inputted);
  
  
  notify(store.getState());
  return () =>  personForm.removeEventListener("input", inputted);
});
const isEmptyOrWhiteSpace = value => value == null || (typeof value === 'string' && value.trim() === '');

const formatArgs = (args) => {
  if (args == null) return;
  if (Array.isArray(args)) return args.filter(d => !isEmptyOrWhiteSpace(d)).join();
  if (typeof args === "string" || typeof args === "number") return args;
  return JSON.stringify(args);
}
const hasAnswer = (answer) => Array.isArray(answer) ? answer.filter(d => !isEmptyOrWhiteSpace(d)).length > 0 : !isEmptyOrWhiteSpace(answer)
```

Body: ${values.totalPoints}/${values.maxTotalPoints}


<div class="grid grid-cols-4" style="grid-auto-rows: auto;">
  
  ${personForm}
  <div>
  <div>${showAnswersInput}</div>
  ${showAnswers ? html`<table class="arch-report">
  <thead><tr>
    <th>Otázka</th>
    <th>Odpověď</th>
    <th>Klíč řešení</th>    
  </tr></thead>
  <tbody>
  ${values.questions.map(({id: key, node}) => html`<tr class=${!hasAnswer(values.answers[key])  ? '' : values.corrections[key] === true ? 'row--success': 'row--danger'}>
  <td>${key}</td>
  <td>${formatArgs(values.answers[key])}</td>
  <td>${formatArgs(node.verifyBy?.args)}</td>
</tr></tbody>`)}</table>`:''}
</div>
</div>