---
title: Vyplňovačka - $code$
sidebar: true
pager: false
footer: false
toc: false
style: /assets/css/quiz-form.css
titleFormat: extractPath
---

```js
import { renderedQuestionsPerQuizWithInputs } from '../components/quiz-form.js';
import { fromEvent, combineLatest, BehaviorSubject } from 'rxjs';
import { map, startWith, tap } from  'rxjs/operators';
import { QuizStore } from '../utils/quiz-store.js';
import * as a from "npm:@appnest/masonry-layout";
import { normalizeImageUrlsToAbsoluteUrls } from "../utils/quiz-string-utils.js";

function getQuestionIds(metadata) {
    return Object.keys(metadata.children).map(d => parseInt(d, 10))    
}
 
const metadata = await FileAttachment(`../${observable.params.source}/${observable.params.period}/key.json`).json();
const rawContentData = await FileAttachment(`../${observable.params.source}/${observable.params.period}/index.md`).text();
const rawContent = normalizeImageUrlsToAbsoluteUrls(rawContentData, [`../${observable.params.source}/${observable.params.period}`])

const code = observable.params.period;
const quizQuestionsMap = {[code]:{rawContent, metadata}};
```

```js
const state = {
  ...values,
  ...store.selectors(values)
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
  #observablehq-main {
    z-index: auto;
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
  quizQuestionsMap,
  subject:'math',
  displayOptions: {useFormControl:true,useAIHelpers:false,useGoToDetail: false, useResources:false},
  mathResourcesMap: {},
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

const store = new QuizStore({metadata});

const values = Generators.observe((notify) => {
  values$.subscribe({
    next: value => {
      store.submitQuiz(Object.fromEntries(value.filter(([key,v]) => v != null)))
      notify(store.getState())
    }
  });
  notify(store.getState());
  return () => values$.unsubscribe();
});

const print =  true;
display(html`<div data-testid="root" style="padding:10px"><masonry-layout gap="15">${renderedQuestions.map(d => print ? html.fragment`${d}`: html`<div class="v-stack v-stack--s">${d}</div>`)}</masonry-layout></div>`);
```