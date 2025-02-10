---
sidebar: true
footer: false
header: false
pager: false
toc: false
style: /assets/css/quiz-form.css
---

```js
import { renderedQuestionsPerQuizWithInputs } from './components/quiz-form.js';
import { parseCode, formatShortCode, formatSubject, formatPeriod} from './utils/quiz-string-utils.js';
import { fromEvent, combineLatest } from 'rxjs';
import { map, startWith, tap } from  'rxjs/operators';
import { store } from './utils/quiz.js';
import * as a from "npm:@appnest/masonry-layout";

function getQuestionIds(metadata, code) {
  const { subject } = parseCode(code);
  return (subject === "cz" || subject === "math")
    ? Object.keys(metadata.children).map(d => parseInt(d, 10))
    : Object.values(metadata.children).flatMap(d => Object.keys(d.children ?? {})).map(d => d.split(".")[1]);
}
 
const metadata = await FileAttachment(`./data/form-${observable.params.code}.json`).json();
//const resourcesMap = await FileAttachment(`./data/quiz-answers-detail-gpt-4o.json`).json();
const mathResourcesMap = await FileAttachment(`./data/math-results.json`).json();
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
  @media (min-width: 521px) {
    masonry-layout .q { padding: 12px; background: var(--theme-background-alt);  border-radius:16px;}
  }
</style>

  <div class="h-stack h-stack--m absolute main-header">
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
  displayOptions: {useFormControl:true,useAIHelpers:false,useResources:true},
  mathResourcesMap,
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

const print =  true;
display(html`<div data-testid="root" style="padding:10px"><masonry-layout gap="15">${renderedQuestions.map(d => print ? html.fragment`${d}`: html`<div class="v-stack v-stack--s">${d}</div>`)}</masonry-layout></div>`);
```