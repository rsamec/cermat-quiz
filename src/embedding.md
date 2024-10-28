---
title: Rozšířitelnost
footer: false
pager: false
toc: true
---

### Vložit do libolných stránek lze pomocí elementu iframe.

<iframe width="100%" height="200" frameborder="0" src="/form-M9A-2024"></iframe>

```html run=false
<iframe width="100%" height="200" frameborder="0" src="/form-M9A-2024"></iframe>
```

### Vložit do stránek pomocí es modulu

```html run=false
<script type="module">

import {renderQuiz} from "https://rsamec.github.io/cermat-quiz/components/quiz.js";
document.body.append(await renderQuiz({selectedQuestions:[{code:'AJA-2024', id:1}]}));

</script>
```
<script type="module">

import {renderQuiz} from "https://rsamec.github.io/cermat-quiz/components/quiz.js";
const el = await renderQuiz({selectedQuestions:[{code:'M9C-2024', id:3}]});
console.log("Element", el)
document.querySelector("main").append(el[0]);

</script>

### Data

Testové úlohy jsou uložené ve strukturovaných formátech. To umožňuje s nimi programově pracovat.






