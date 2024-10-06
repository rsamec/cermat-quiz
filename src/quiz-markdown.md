---
title: Quiz markdown
---

```js echo
mdPlus.unsafe(`This is a checkbox, {red}(supported by) combining [markdown-it](https://github.com/markdown-it/markdown-it) and [markdown-it-task-lists](https://github.com/revin/markdown-it-task-lists).

# first heading 1 10°

20 cm^2^

Here is a footnote reference,[^1] and another.[^longnote]


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