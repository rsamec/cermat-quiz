---
theme: ["wide"]
sidebar: false
footer: false
pager: false
toc: false
style: /assets/css/quiz.css
---

```js
import { renderedQuestionsPerQuizWithInputs } from './components/quiz-form.js';
import { getQuestionIds } from './utils/quiz-utils.js';
import { parseCode, formatShortCode, formatSubject, formatPeriod} from './utils/quizes.js';
import { fromEvent, combineLatest } from 'rxjs';
import { map, startWith, tap } from  'rxjs/operators';
import { store } from './utils/quiz.js';

 
const metadata = await FileAttachment(`./data/form-${observable.params.code}.json`).json();
const resourcesMap = await FileAttachment(`./data/quiz-answers-detail-gpt-4o.json`).json();
const rawContent = await FileAttachment(`./data/form-${observable.params.code}.md`).text();
const code = observable.params.code;
const quizQuestionsMap = {[code]:{rawContent, metadata}};
const {subject,period}  = parseCode(code);
```

```js
const state = {
  ...values.quiz,
  ...selection(values)
}
```
<style>
    #observablehq-center,
    #observablehq-main,
    .observablehq-center,
    .observablehq-main,
    .observablehq .observablehq--block {
      margin: 0px;
  }
</style>

<div class="h-stack h-stack--m h-stack--wrap h-stack-items--center sticky main-header">
  <div class="h-stack h-stack--m" style="flex:1;">
  ${html`<a href="./quiz-summary-${subject}-${period}"><i class="fa-solid fa-left-long"></i></a>`}
  <span>/</span>${formatShortCode(code)}</div>
  <div class="h-stack h-stack--m h-stack--end">
    ${showInput}
    <div class="badge">
      <i class="fa fa-hashtag"></i>
      <span>${state.totalAnswers}</span>
    </div>
    <div class="badge">
      <i class="fa fa-calculator"></i>
      <span>${state.totalPoints ?? 0}</span>
    </div>
  </div>
</div>


```js
// const showInput = Inputs.button(html`<button class="badge">
//       <i class="fa-solid fa-toggle-off"></i>
//       <span>Nápověda</span>
//     </button>`, {reduce: (value) => !value });

const showInput = Inputs.checkbox(new Map([
  ['AI', ['useAIHelpers',true]],
  ['Řešení', ['useResources',true]]
]))
const displayOptions = Generators.input(showInput);

```
```js

const parameters = ({
  questions: [[code].concat(getQuestionIds(metadata,code))],
  subject:parseCode(code).subject,
  quizQuestionsMap,
  displayOptions: {useFormControl:true, ...Object.fromEntries(displayOptions)},
  resourcesMap
})
const {renderedQuestions, inputs:inputsStore} = renderedQuestionsPerQuizWithInputs(parameters);

function combineInputValues(inputs) {  
  const inputObservables = Object.entries(inputs).map(([key,input]) => 
    fromEvent(input, 'input').pipe(
      map(event => [key, input.value]),
      startWith([key,undefined]) // Initialize each input with an empty string
    )
  );

  return combineLatest(inputObservables);
}
const values$ = combineInputValues(inputsStore[code] ?? {});

const { dispatch } = store;
const selection = store.select((models) => ({
    totalAnswers: models.quiz.totalAnswers,
    maxTotalAnswers: models.quiz.maxTotalAnswers,
}));

const values = Generators.observe((notify) => {
  dispatch.quiz.init({metadata,answers:{}});
  values$.subscribe({
    next: value => {
      dispatch.quiz.submitQuiz(Object.fromEntries(value.filter(([key,v]) => v != null)))
      notify(store.getState())
    }
  });
  notify([]);
  return () => values$.unsubscribe();
});

const print =  false;
display(html`<div data-testid="root" class="root">${renderedQuestions.map(d => print ? html.fragment`${d}`: html`<div class="v-stack v-stack--s">${d}</div>`)}</div>`);
```