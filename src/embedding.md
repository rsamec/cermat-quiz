---
title: Rozšířitelnost
footer: false
pager: true
toc: true
---

## iframe vložení

vložit do www stránek lze pomocí elementu iframe.

---
<iframe width="100%" height="200" frameborder="0" src="https://www.cermatdata.cz/form-M9A-2024"></iframe>

```html run=false
<iframe width="100%" height="200" frameborder="0" src="https://www.cermatdata.cz/form-M9A-2024"></iframe>
```

## javascript module

vložit do www stránek pomocí javascript module


<script type="module">
import {renderQuiz} from "https://www.cermatdata.cz/components/quiz-html.js";
const fragment = await renderQuiz('M9A-2024',[1,2,7]);
document.querySelector("#quiz").append(fragment);
</script>

---
<div id="quiz" class="quiz-placeholder"></div>

```html run=false
<script type="module">
import {renderQuiz} from "https://www.cermatdata.cz/components/quiz-html.js";

//render elements
const fragment = await renderQuiz('M9A-2024',[1,2,7]);

//append elements to DOM
document.querySelector("#quiz").append(fragment);

</script>
<div id="quiz" class="quiz-placeholder"></div>
```
---

## API - vlastní aplikace


```html run=false
<script type="module">
import {loadQuiz} from "https://www.cermatdata.cz/components/quiz.js";

const quizProvider = await loadQuiz('C9I-2025'); //load and parse quiz
const questions = quizProvider.questions; //array of questions in quiz
const quizContent = quizProvider.content(questions.map(d => d.id)) // quiz content in markdown
const secondQuestionContent = quizProvider.content([2]) // second question content in markdown

</script>
```

<div class="tip">
Pokud je potřeba oddělit načtení a parsování dat, můžete použít metodu <b>parseQuiz</b>.
</div>

```html run=false
<script type="module">
import {parseQuiz} from "https://www.cermatdata.cz/components/quiz.js";

//fetch data
const response = await fetch('https://raw.githubusercontent.com/rsamec/cermat/refs/heads/main/public/cz/4/C9I-2025/index.md');
if (!response.ok) {
   throw new Error(`HTTP error! status: ${response.status}`);
}
const text = await response.text();

const quizProvider = parseQuiz(text); //parse quiz
const questions = quizProvider.questions; //array of questions in quiz
const quizContent = quizProvider.content(questions.map(d => d.id)) // quiz content in markdown
const secondQuestionContent = quizProvider.content([2]) // second question content in markdown

</script>
```


<iframe width="100%" height="300" frameborder="0" src="https://stackblitz.com/edit/vitejs-vite-jaf9wowd?embed=1&file=src%2Fquiz.jsx"></iframe>

Databanku úloh využívá např. trénovací PWA aplikace [eforms](https://www.eforms.cz).


## vlastní styly

```js
const theme = view(Inputs.button([
  ["font", (value, item) => document.querySelector("#quiz-with-custom-style").classList.toggle(`quiz-with-custom-style--font`)],
  ["blockquote", (value,item) => document.querySelector("#quiz-with-custom-style").classList.toggle(`quiz-with-custom-style--blockquote`)],
  ["columns", (value,item) => document.querySelector("#quiz-with-custom-style").classList.toggle(`quiz-with-custom-style--blockquote-columns`)],
  ["hightlight", (value,item) => document.querySelector("#quiz-with-custom-style").classList.toggle(`quiz-with-custom-style--highlight`)],
], {value: 0, label: "Toggle styles"}));
```
<script type="module">
import {renderQuiz} from "https://www.cermatdata.cz/components/quiz-html.js";
const fragment = await renderQuiz('CMA-2024');
document.querySelector("#quiz-with-custom-style").append(fragment);
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Atma:wght@300;400;500;600;700&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">

<div id="quiz-with-custom-style" class="quiz-placeholder quiz-with-custom-style"></div>

<style>
  .quiz-placeholder
  {
    max-height: 350px;
    overflow-y:scroll;
  }

  .quiz-with-custom-style--highlight
  {
    h2>span:first-of-type {
      float: left;
      margin-right: 4rem;
      font-size: 6rem;
    }
  }

  .quiz-with-custom-style--font
  {
    font-family: "Atma", system-ui;
    font-weight: 400;
    font-style: normal;
  }
  .quiz-with-custom-style--blockquote-columns
  {
    blockquote {
      columns: 16rem;
    }
  }
  .quiz-with-custom-style--blockquote
  {    

    p:has(+ blockquote),
    blockquote {
      margin: 0 auto;
      padding: 1em;
     
    }
    blockquote {
       border-left: 5px solid #999;
    }
    blockquote:before {
      display: none;
    }
    blockquote:not(:first-of-type) {
      margin-top: .5em;
    }
    blockquote p {
      color: #555;
      font-size: 12pt;
      line-height: 1.4;
    }
    blockquote footer {
      margin-top: .5em;
      padding: 0;
      color: #777;
      font-size: 12pt;
      text-align: left;
      font-style: italic;
    }
    blockquote footer:before {
      content: '— ';
    }
    p:has(+ blockquote):nth-of-type(even),
    blockquote:nth-of-type(even) {
      text-align: right;      
    }    
    blockquote:nth-of-type(even) {
      border-left: none;      
      border-right: 5px solid #999;
    }
    blockquote:nth-of-type(even) footer {
      text-align: right;
    }
    blockquote:nth-of-type(even) footer:before {
      content: '';
    }
    blockquote:nth-of-type(even) footer:after {
      content: ' —';
    }
    @element 'blockquote' and (min-width: 300px) {
      blockquote {
        padding: 1em 20% 1em 1em;
      }
      blockquote p {
        font-size: 14pt;
      }
      blockquote:nth-of-type(even) {
        padding: 1em 1em 1em 20%;
      }
    }
  }
</style>

```html run=false
<link href="https://fonts.googleapis.com/css2?family=Atma:wght@300;400;500;600;700&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">

<style>
.quiz-with-custom-style--highlight
  {
    h2>span:first-of-type {
      float: left;
      margin-right: 4rem;
      font-size: 6rem;
    }
  }

  .quiz-with-custom-style--font
  {
    font-family: "Atma", system-ui;
    font-weight: 400;
    font-style: normal;
  }
  .quiz-with-custom-style--blockquote-columns
  {
    blockquote {
      columns: 16rem;
    }
  }
  .quiz-with-custom-style--blockquote
  {    

    p:has(+ blockquote),
    blockquote {
      margin: 0 auto;
      padding: 1em;
     
    }
    blockquote {
       border-left: 5px solid #999;
    }
    blockquote:before {
      display: none;
    }
    blockquote:not(:first-of-type) {
      margin-top: .5em;
    }
    blockquote p {
      color: #555;
      font-size: 12pt;
      line-height: 1.4;
    }
    blockquote footer {
      margin-top: .5em;
      padding: 0;
      color: #777;
      font-size: 12pt;
      text-align: left;
      font-style: italic;
    }
    blockquote footer:before {
      content: '— ';
    }
    p:has(+ blockquote):nth-of-type(even),
    blockquote:nth-of-type(even) {
      text-align: right;      
    }    
    blockquote:nth-of-type(even) {
      border-left: none;      
      border-right: 5px solid #999;
    }
    blockquote:nth-of-type(even) footer {
      text-align: right;
    }
    blockquote:nth-of-type(even) footer:before {
      content: '';
    }
    blockquote:nth-of-type(even) footer:after {
      content: ' —';
    }
    @element 'blockquote' and (min-width: 300px) {
      blockquote {
        padding: 1em 20% 1em 1em;
      }
      blockquote p {
        font-size: 14pt;
      }
      blockquote:nth-of-type(even) {
        padding: 1em 1em 1em 20%;
      }
    }
  }
</style>
```
---

## observableHQ playground

Příklady využití databanky úloh v prostředí [ObservableHQ](https://observablehq.com).

<iframe width="100%" height="300" frameborder="0"
  src="https://observablehq.com/embed/@rsamec/c9a-2024@428?cells=q6%2Cq15%2Cq18%2Cq25%2Cstyles"></iframe>

<iframe width="100%" height="300" frameborder="0"
  src="https://observablehq.com/embed/@rsamec/m9c-2024?cells=q9%2Csteps9%2Cq10%2Csteps10"></iframe>


