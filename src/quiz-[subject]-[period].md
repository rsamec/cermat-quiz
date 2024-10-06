---
title: Quiz
theme: ["wide"]
sidebar: true
header: false
footer: false
pager: false
toc: false
---

```js
import { parser, GFM, Subscript, Superscript } from 'npm:@lezer/markdown';
import { signal, computed, batch } from '@preact/signals-core';
import {getQuizBuilder, OptionList, ShortCodeMarker, getAllLeafsWithAncestors} from './utils/parse-utils.js';
import mdPlus from "./utils/md-utils.js";
import {convertTree, formatSubject, formatPeriod, parseCode, formatCode, categories} from './utils/quiz-utils.js';
import {html as rhtml} from './utils/reactive-htl.js';
```

```js
const quizLangCategories = await FileAttachment("./data/quiz-lang-categories.json").json();
const quizGeneratedCategories = await FileAttachment("./data/quiz-categories.json").json();
const quizCategories = ({
  ...quizLangCategories,
  ...quizGeneratedCategories
})

const filteredQuizCategories = Object.entries(quizCategories).flatMap(([code, value]) =>
  value.questions.map((d) => {
    const parsedCode = parseCode(code);
    return {
      ...d,
      code,      
      period: parsedCode.period,      
      subject: parsedCode.subject,
      Category: categories[parsedCode.subject][d.category],
    };
  })
).filter(d => d.subject === observable.params.subject && d.period === observable.params.period)

const selectedQuestions = view(Inputs.table(filteredQuizCategories));
const quizQuestionsMap = await FileAttachment(`./data/quiz-${observable.params.subject}-${observable.params.period}.json`).json();
```


```js
function chunkMetadataByInputs(metadata, subject, selectedIds = []) {
  const leafs = Object.groupBy(getAllLeafsWithAncestors(convertTree(metadata)), ({ leaf }) => parseQuestionId(leaf.data.id, subject))
  //return leafs;
  return Object.entries(leafs).filter(([key,]) => selectedIds.indexOf(parseInt(key,10)) !== -1).reduce((out, [key, values]) => {    
    const groupKey = values[0].ancestors[1].data.node.metadata?.inline ?? false;    
    const lastValue = out.length > 0 ? out[out.length - 1] : null;
    
    if (lastValue == null || lastValue[0] != groupKey) {
      out.push([groupKey, [[key,values]]]);
    } else {
      lastValue[1].push([key,values]);
    }

    return out;
  }, []);
}
```
```js
  
  const quizWithControls = Object.entries(Object.groupBy(selectedQuestions, ({code}) => code)).map(
    ([code, values]) => 
   {
    const ids = values.map(d => parseInt(d.id,10));
    const quizContent = quizQuestionsMap[code];
    const quizBuilder = quizContent ? makeQuizBuilder(quizContent.rawContent): null;
    const subject = observable.params.subject;
    const optionsMap = Object.fromEntries(
        quizBuilder.questions.map((d) => [d.id, d.options])
    );
    const chunks = chunkMetadataByInputs(quizQuestionsMap[code].metadata, subject,ids);
    
    return html`<div>${chunks.flatMap(([inline,g]) => g.map(([key, leafs]) => {
        const ids = [parseInt(key,10)];        
        //const filteredIds = ids.filter(id => id == key);        
        return html`<div class="avoid">
          <div>
            ${mdPlus.unsafe(`${quizBuilder.content(ids)}`)}
          </div>
        ${rhtml`<div class="clear-both form-group">${leafs.map((data) => {
              const d = data.leaf.data.node;
              const label = data.leaf.data.id;
              const id = parseQuestionId(label, subject);
              
              const { inputBy, verifyBy } = d;
              const component = Array.isArray(inputBy)
                ? Inputs.text({ submit: true, label: leafs.length > 1 && label})
                : inputBy.kind === "sortedOptions"
                ? Inputs.text({ submit: true, label: leafs.length > 1 && label})
                : inputBy.kind === "options"
                ? Inputs.radio(optionsMap[id] ?? [], {
                    format: (d) => mdPlus.unsafe(d.name),
                    label: leafs.length > 1 && label,
                  })
                : inputBy.kind === "bool"
                ? Inputs.radio([true, false], {
                    format: (d) => (d === true ? "Ano" : "Ne"),
                    label: leafs.length > 1 && label,
                  })
                : Inputs.text({ submit: true, label: leafs.length > 1 && label});
              component.classList.add("form-control");

              const answer = verifyBy.args;
              const inputValue = useInput(component);

              return rhtml`<div class=${computed(() => inputValue)}>${component}</div>`;
            })}</div>`}

          
        </div>`
        }))
      }</div>`      
   });
   
   display(html`${quizWithControls.map(d=> d)}`)
```

```js
  
  const questionsToRender = Object.entries(Object.groupBy(selectedQuestions, ({code}) => code)).map(
    ([code, values]) => 
   {
      const quizContent = quizQuestionsMap[code];
      const quizBuilder = quizContent ? makeQuizBuilder(quizContent.rawContent): null;
            
      return quizContent ? {code,
        content:() => quizBuilder.content(values.map(d => parseInt(d.id,10))),
      }: {code, content:() => 'Quiz is not available'}
    }
    )
  const quiz = html`<style>img { max-width: 100%;height: auto;}</style><div style="columns: 24rem;">${html`${questionsToRender.map(
    (d) => html`<div><h0 class="highlight">${formatCode(d.code)}</h0>${mdPlus.unsafe(`${d.content()}`)}</div>`
  )}`}</div>`

  //display(quiz);
```
```js
function useInput(input){
  const s = signal(input.value);

  // Update the signal on input events from the range slider
  const changed = (e) => (s.value = input.value);
  
  input.addEventListener("input", changed);
  invalidation.then(() => input.removeEventListener("input", changed));
  return s;

}
```
```js
function makeQuizBuilder(normalizedQuiz) {
  const markdownParser = parser.configure([[ShortCodeMarker, OptionList], GFM, Subscript, Superscript]);
  const parsedTree = markdownParser.parse(normalizedQuiz);
  return getQuizBuilder(parsedTree,normalizedQuiz);
}
```
```js
function parseQuestionId(id, subject) {
  const parts = id.split(".");
  return parseInt(
    (subject === "cz" || subject === "math") ? parts[0] : parts[1],
    10
  );
}
```