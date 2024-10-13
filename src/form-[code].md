---
title: Quiz form
theme: ["wide"]
footer: false
pager: false
toc: true
style: /assets/css/quiz.css
---

```js
import { renderQuizWithInputs } from './components/quiz-form.js';
import { parseCode } from './utils/quiz-utils.js';


const metadata = await FileAttachment(`./data/form-${observable.params.code}.json`).json();
const rawContent = await FileAttachment(`./data/form-${observable.params.code}.md`).text();
const code = observable.params.code;
const quizQuestionsMap = {[code]:{rawContent, metadata}};
const searchParams = Object.fromEntries(new URLSearchParams(location.search));
```

```js
const parameters = ({
  questions: [[code].concat(Object.keys(metadata.children).map(d => parseInt(d,10)))],
  subject:parseCode(code).subject,
  quizQuestionsMap,
  displayOptions: {useFormControl:true}
})
const [quizWithControls, inputsStore] = renderQuizWithInputs(parameters);
const inputs = inputsStore[code]
const value = Generators.input(inputs['1']);
const values = Object.values(inputs).map(d => Generators.input(d));

display(renderQuizInCoumns(html`${quizWithControls.map(d=> d)}`));
```



```js
function renderQuizInCoumns(content){
  return html`<style>img { max-width: 100%;height: auto;}</style><div style="columns: 24rem;">${content}</div>`
}
```