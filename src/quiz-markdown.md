---
title: Quiz markdown
draft: true
---

<script type="module">


import {renderedQuestionsPerQuiz} from "http://127.0.0.1:3000/_import/components/quiz-form.js";
const data = await renderedQuestionsPerQuiz({selectedQuestions:[...Array(60)].map((d,i) => ({code:'AJA-2024',id:i+1}))})
document.getElementById("iframe-target").appendChild(html`${data}`);

</script>

<div id="iframe-target">aa</div>


```js echo
mdPlus.unsafe(`This is a checkbox, {red}(supported by) combining [markdown-it](https://github.com/markdown-it/markdown-it) and [markdown-it-task-lists](https://github.com/revin/markdown-it-task-lists).

# first heading 1 10°

20 cm^2^

some __underline__ text
some _underline_ text
some **bold** text
some *bold* text

Here is a footnote reference,[^1] and another.[^longnote]

inline latex $\\vec{u}=(3;\\vec{u}_{2}) \\backslash \\{0\\}$


$\\frac{3}{4} \\times 24 = 18 \\text{ litru}$

$\\text{ litru}$

$$a+b=-1$$
 $$ab=-2$$ 

$x=-1$ <br/> $x=2$

$$
x=\\frac{-\\left(-1\\right)±\\sqrt{1+8}}{2}
$$

$$\\frac{-b+\sqrt{b^{2}-4ac}}{2a}$$

$$
\\frac{\\frac{2}{3}-1}{\\frac{8}{9}}
$$

[^1]: Here is the footnote.
[^longnote]: Here's one with multiple blocks.


# 11 Jaká je velikost rozdílu úhlů $\\gamma -\\alpha C$? 
Velikost úhlů neměřte, ale vypočítejte (obrázek je ilustrační).$10\\deg$
- [A] $10 \\circle$
- [B] $11 \\degree$
- [C] $12 \\degree$
- [D] $13 \\degree$
- [E] jiná velikost


$$ 
\\left(2\\div\\frac{3}{2}\\right)\\div\\frac{1}{2}+\\left(\\frac{5}{6}\\div\\frac{3}{4}\\right)\\div\\frac{2}{3}
$$

Tereza a její kamarádka Nikola píší novoroční přání. Všechna přání mají stejný text a každá z dívek píše stálou rychlostí. Tereza za každých 5 minut napíše 14 novoročenek, zatímco Nikola 10.

$\\frac{1}{2}$
$\\beta=$

$$ 
\\frac{1}{2} 
$$


- [ ] Checklist
- [ ] Chore 1
- [x] Chore 2
- [x] Chore 3
- [ ] Chore 4
- [ ] Chore 5`)
```

```js
import mdPlus from "./utils/md-utils.js";
```