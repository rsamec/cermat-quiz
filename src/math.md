---
footer: false
pager: true
toc: true
---
# Výrazy, rovnice, konstrukční úlohy


```js
import { baseDomain, baseDomainPublic, formatSubject, formatPeriod, formatShortCode} from './utils/quiz-string-utils.js';
import { quizes } from "./utils/quiz-utils.js";
import mdPlus from './utils/md-utils.js';
const mathMetricsData = await FileAttachment("./data/math-metrics.json").json();
```

${quizes.filter(d => d.subject == 'math').map(({subject, period, codes}) => html`<h3>${formatSubject(subject)} ${formatPeriod(period)}</h3> <ul>${
  codes.map(code => {
    const metrics = mathMetricsData.find(d => d.key == code);
    const anyExpression = metrics?.expression?.count > 0;
    const anyGeometry = metrics?.geometry?.count > 0;
return (anyExpression || anyGeometry) ? html`<li>${formatShortCode(code)}<ul>${anyExpression ? html`<li><a class="h-stack h-stack--s h-stack-items--center" href="./math-answers-${code}"><i class="fa-solid fa-square-root-variable"></i>výrazy, rovnice</a></li>`:''}${anyGeometry ? html`<li><a class="h-stack h-stack--s h-stack-items--center" href="./math-geometry-${code}"><i class="fa-solid fa-drafting-compass"></i>konstruční úlohy</a></li></ul></li>`:''}`:''
})}</ul>`)}


## Řešení matematických výrazů a rovnic

K automatickému řešení matematických výrazů je použití <a href="https://math.microsoft.com/"><i class="fa-brands fa-microsoft"></i> Microsoft Math</a> API.

Hlavní přidanou hodnotou je krokové vysvětlení řešení, které pomáhá uživateli pochopit problematiku hlouběji. Na základě kroků řešení jsou generována i vysvětlující videa.


## Jak je to uděláno?

1. Vyhledání matematických výrazů v testech
2. Zavolání Microsoft Math API

<div class="warning" label="Již nefunční API">

Microsoft Math Solver ukončeno v July 7, 2025.

[https://x.com/MicrosoftMath/status/1931103750753599946]()

</div>
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

## Řešení konstrukčních úloh

K vytvoření gemoetrických konstrukcí je použita knihovna <a href="https://rulerandcompass.org/">RAC - Ruler and Compass</a>.

Konstrukční úloha je rozdělena na části

 - zadání úlohy - kalibrace úlohy, dle obrázku vytvoříme geometrickou konstrukci, která odpovídá zadání (libovoná velikost konstrukce, ale vždy zachovat proporci mezi objekty)
 - kroky řešení - jednotlivé operace simulují použití pravítka a kružítka
 - finální konstrukce
  

Každá část je vykreslena jinou barvou. Řešení je rozděleno na jednotlivé kroky, aby bylo možno vykreslovat po krocích. Toto řešení umožňuje generovat vysvětlující videa.


## Jak je to uděláno?

```js run=false

smartDrawing(300, (rac, shared) => {  

    //calibration
    const S = rac.Point(116, 159);
    const E = rac.Point(218, 144);
    const A = rac.Point(59, 211);

    const radius = S.distanceToPoint(A);
    const k = S.arc(radius, 5 / 8, 5 / 8);

    const calibration = rac
      .Composite([
        markPoint(rac, S, "S", rac.Text.Format.tl),
        markPoint(rac, E, "E", rac.Text.Format.bl),
        markPoint(rac, A, "A"),
        k,
        k.text("k")
      ])
      .draw(); // draw input

    //solution steps
    const rAS = A.rayToPoint(S); // 1. ↦AS
    const C = k.intersectionChordEndWithRay(rAS); // 2. C;C∈k∩↦AS
    const rCE = C.rayToPoint(E); // 3. ↦E
    const B = rCE.pointAtDistance(C.distanceToPoint(E) * 2); // 4. B;B∈↦CE;∣CE∣=∣BE∣    
    const rBA = B.rayToPoint(A); // 5. ↦BA
    const rAD = A.ray(rBA.perpendicular().angle); // 6. ↦A;↦A⊥↦BA
    const D = k.intersectionChordEndWithRay(rAD); // 7. D;D∈k∩↦A

    const steps = rac.Composite([
      rAS,
      markPoint(rac, C, "C", rac.Text.Format.bl),
      rCE,
      markPoint(rac, B, "B", rac.Text.Format.bl),
      rBA,
      rAD,
      markPoint(rac, D, "D", rac.Text.Format.br),
      result
    ])
    .draw(shared.secondary); // draw solution steps

    
    polygon(rac, [A, B, C, D]) //final construction -  □ABCD
    .draw(shared.primary) // draw final polygon
})
```
