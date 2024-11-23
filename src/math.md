---
footer: false
pager: true
toc: true
---

```js
import { baseDomain, baseDomainPublic, formatSubject, formatPeriod, formatShortCode} from './utils/quiz-string-utils.js';
import { quizes } from "./utils/quiz-utils.js";
import mdPlus from './utils/md-utils.js';
```

# Řešení matematických výrazů

Použití <a href="https://math.microsoft.com/"><i class="fa-brands fa-microsoft"></i> Microsoft Math</a> API k automatickému řešení matematických výrazů.

Hlavní přidanou hodnotou je krokové vysvětlení řešení, které pomáhá uživateli pochopit problematiku hlouběji. Na základě kroků řešení jsou generována i vysvětlující videa.


*Pro zobrazení řešení úloh vyberte odkaz na test ze seznamu*

${quizes.filter(d => d.subject == 'math').map(({subject, period, codes}) => html`<h3>${formatSubject(subject)} ${formatPeriod(period)}</h3> <ul>${
  codes.map(code => html`<li>${formatShortCode(code)}<ul><li><a class="h-stack h-stack--s h-stack-items--center" href="./math-${code}"><i class="fa-solid fa-square-root-variable"></i>řešení výrazů</a></li></ul></li>`
)}</ul>`)}


## Jak je to uděláno?

1. Vyhledání matematických výrazů v testech
2. Zavolání Microsoft Math API

### 1. Vyhledání matematických výrazů v testech

```js run=false
import markdownit from "markdown-it";
import * as katex from 'markdown-it-katex';

const Markdown = new markdownit({ html: false })
  .use(katex.default, {})

//get test content
const content = await text(`${baseUrl}/index.md`);
//parse markdown
const tokens = Markdown.parse(content, {});
// find math tokens
tokens.filter(token => token.type === 'math_block').map(d => d.content)

console.log(`Math tokens found: ${tokens}`)

// helper function
async function text(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return await response.text();
}

```

### 2. Zavolání Microsoft Math API

```js run=false
async function json(url, data) {
  const response = await fetch(url,
    {
      headers: {
        'content-type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify(data)
    });
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return await response.json();
}
async function solveLatex(latexExpression) {
  let result = await json("https://mathsolver.microsoft.com/cameraexp/api/v1/solvelatex", {
    latexExpression,
    clientInfo: {
      mkt: 'cs'
    }
  });
  return result;
}

solveLatex('\\frac{5}{9} - \\frac{5}{9}: 5 =')
```