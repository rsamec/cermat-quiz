---
title: Rozšířitelnost
header: Embedding
footer: false
pager: false
toc: true
---

## iframe

vložit do www stránek lze pomocí elementu iframe.

---
<iframe width="100%" height="200" frameborder="0" src="https://rsamec.github.io/cermat-quiz/form-M9A-2024"></iframe>

```html run=false
<iframe width="100%" height="200" frameborder="0" src="https://rsamec.github.io/cermat-quiz/form-M9A-2024"></iframe>
```

## javascript module

vložit do www stránek pomocí javascript module


<script type="module">
import {renderQuiz} from "https://rsamec.github.io/cermat-quiz/components/quiz.js";
const fragment = await renderQuiz('M9A-2024',[1,2,7]);
document.querySelector(".quiz-placeholder").append(fragment);
</script>

---
<div class="quiz-placeholder"></div>

```html run=false
<script type="module">
import {renderQuiz} from "https://rsamec.github.io/cermat-quiz/components/quiz.js";

//render elements
const fragment = await renderQuiz('M9A-2024',[1,2,7]);

//append elements to DOM
document.querySelector(".quiz-placeholder").append(fragment);

</script>
<div class="quiz-placeholder"></div>

```
---

## observable playground

<iframe width="100%" height="300" frameborder="0"
  src="https://observablehq.com/embed/@rsamec/c9a-2024@428?cells=q6%2Cq15%2Cq18%2Cq25%2Cstyles"></iframe>

<iframe width="100%" height="300" frameborder="0"
  src="https://observablehq.com/embed/@rsamec/m9c-2024?cells=q9%2Csteps9%2Cq10%2Csteps10"></iframe>

