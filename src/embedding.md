---
title: Rozšířitelnost
footer: false
pager: false
toc: true
---

## Vložit do libolných stránek lze pomocí elementu iframe.

<iframe width="100%" height="200" frameborder="0" src="/form-M9A-2024"></iframe>

```html run=false
<iframe width="100%" height="200" frameborder="0" src="/form-M9A-2024"></iframe>
```
---

## Vložit do stránek pomocí javascript module


<script type="module">
import {renderQuiz} from "https://rsamec.github.io/cermat-quiz/components/quiz.js";
const elements = await renderQuiz('M9A-2024');
for (let el of elements){
  document.querySelector(".quiz-placeholder").append(el);
}
</script>

<div class="quiz-placeholder"></div>

```html run=false
<script type="module">
import {renderQuiz} from "https://rsamec.github.io/cermat-quiz/components/quiz.js";

//render elements
const elements = await renderQuiz('M9A-2024');

//append elements to DOM
for (let el of elements){
  document.querySelector(".quiz-placeholder").append(el);
}
</script>

<div class="quiz-placeholder"></div>
```
---

### Data

Testové úlohy jsou uložené ve strukturovaných formátech. To umožňuje s nimi programově pracovat.






