---
title: Quiz form
theme: ["wide"]
footer: false
pager: false
toc: true
style: /assets/css/quiz.css
---

```js
import { renderedQuestionsPerQuizWithInputs } from './components/quiz-form.js';
import { getQuestionIds } from './utils/quiz-utils.js';
import { parseCode, formatShortCode} from './utils/quizes.js';
import { fromEvent, combineLatest } from 'rxjs';
import { map, startWith, tap } from  'rxjs/operators';
import { store } from './utils/quiz.js';

 
const metadata = await FileAttachment(`./data/form-${observable.params.code}.json`).json();
const rawContent = await FileAttachment(`./data/form-${observable.params.code}.md`).text();
const code = observable.params.code;
const quizQuestionsMap = {[code]:{rawContent, metadata}};
```
```js
const state = {
  ...values.quiz,
  ...selection(values)
}
```
<div class="h-stack h-stack--m h-stack--wrap h-stack-items--start sticky bg-white">
<div style="flex:1;">${formatShortCode(code)}</div>
<div class="h-stack h-stack--m h-stack--end">
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
const parameters = ({
  questions: [[code].concat(getQuestionIds(metadata,code))],
  subject:parseCode(code).subject,
  quizQuestionsMap,
  displayOptions: {useColumns: true, useFormControl:true, useAIHelpers: true}
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

const {useColumns,columnWidth} = parameters.displayOptions;

display(html`<div data-testid="root">${renderedQuestions.map(d => html`<div style=${useColumns ? `columns:${columnWidth ?? 24}rem`:''}>${d}</div>`)}</div>`);
```