---
toc: false
footer: false
---

<div class="hero">
  <h1>Cermat úlohy</h1>
  <h2>Mimooficiální data banka úloh</h2>
  <a href="https://cermat.cz/">Data<span style="display: inline-block; margin-left: 0.25rem;">↗︎</span></a>
</a>
</div>

```js
import {convertTree, categories} from './utils/quiz-utils.js';
import {formatShortCode, formatSubject, formatPeriod, parseCode} from './utils/quizes.js';
const quizLangCategories = await FileAttachment("./data/quiz-lang-categories.json").json();
const quizGeneratedCategories = await FileAttachment("./data/quiz-categories.json").json();
const quizCategories = ({
  ...quizLangCategories,
  ...quizGeneratedCategories
})

const quizQuestions = Object.entries(quizCategories).flatMap(([code, value]) =>
  value.questions.map((d) => {
    const parsedCode = parseCode(code);
    return {
      ...d,
      code,
      period: parsedCode.period,
      subject: parsedCode.subject,
      year: parsedCode.year,
      Category: categories[parsedCode.subject][d.category],
    };
  })
)


const subjects = ["math","cz","en","de"];
const periods = ["4","6","8", "diploma"];

const subjectWithPeriods = {
  math:{periods, codes: codesBy({subject:'math'})},
  cz:{periods, codes: codesBy({subject:'cz'})},
  en:{periods:["diploma"],codes: codesBy({subject:'en'})},
  de:{periods:["diploma"],codes: codesBy({subject:'de'})},
}

function codesBy({subject, period}){
  return Object.keys(Object.groupBy(quizQuestions.filter((d) => (subject == null || d.subject === subject) && (period == null || d.period === period)).sort((f,s) => s.year - f.year), ({code}) => code))
}
```


<!-- Cards with big numbers -->

<div class="grid grid-cols-4" style="grid-auto-rows: auto;">
 ${subjects.map(subject => html`<div class="card">
    <h2><strong>${formatSubject(subject)}</strong></h2>
    <div class="v-stack v-stack--l">
    <div class="v-stack v-stack--s">
      <div>
        <span class="big">${quizQuestions.filter((d) => d.subject === subject).length.toLocaleString("en-US")}</span>
        <span>úloh</span>
      </div>
      <div class="h-stack h-stack--m h-stack--wrap">
      ${subjectWithPeriods[subject].periods.map(period => html`<a class="h-stack h-stack--xs" href="./quiz-builder-${subject}-${period}">${formatPeriod(period)}<span><span>↗︎</span><span></a>
        `)}
      </div>
     </div>
     <div class="v-stack v-stack--s">
      <div>
        <span class="big">${subjectWithPeriods[subject].codes.length.toLocaleString("en-US")}</span>
        <span>testů</span>
      </div>
      <div class="h-stack h-stack--m h-stack--wrap">
      ${subjectWithPeriods[subject].periods.map(period => html`<a class="h-stack h-stack--xs" href="./quiz-summary-${subject}-${period}">${formatPeriod(period)}<span><span>↗︎</span><span></a>
        `)}
      </div>
    </div>
    </div>
  </div>`)}
</div>

---

<div class="grid grid-cols-4" style="grid-auto-rows: auto;"> 
  <div class="card">
    <h1><strong>Přepoužitelnost</strong></h1>
    <div class="v-stack v-stack--m">
      <span>Možnost vložit do vlastních školních stránek. Vytvořit si vlastní grafickou podobu testu. Stavět vlastní aplikace.</span>
      <a href="/embedding">Více informací<span style="display: inline-block; margin-left: 0.25rem;">↗︎</span></a>
    </div>
  </div>
  <div class="card grow">
    <h1><strong>Vlastní sestavení testu</strong></h1>
     <div class="v-stack v-stack--m">
      <span>Naklikej si vlastní porci úloh. Výsledek si vytiskni nebo využij na online trénování.</span>
      <a href="/builder">Více informací<span style="display: inline-block; margin-left: 0.25rem;">↗︎</span></a>
    </div>
  </div>
  <div class="card grow">
    <h1><strong>Tisk</strong></h1>
     <div class="v-stack v-stack--m">
      <span>Tužka a papír pomáhá přemýšlení, učení a zapamatování. Psaní rukou není rozhodně jen pro milovníky historie. Podrhávejte, používejte zvýrazňovače, rýsujte a počítejte na papír. Papír nebo technologie?</span>
      <a href="/print">Více informací<span style="display: inline-block; margin-left: 0.25rem;">↗︎</span></a>
    </div>
  </div>
  <div class="card grow">
    <h1><strong>Video rozbory a AI</strong></h1>
     <div class="v-stack v-stack--m">
      <span>Jeden obrázek vydá za tisíc slov. Dobrá vizualizace usnadňuje pochopení úlohy. AI jako nástroj né jako řešení. V případě nouze použij ChatGTP tlačítko.</span>
      <a href="/solver">Více informací<span style="display: inline-block; margin-left: 0.25rem;">↗︎</span></a>
    </div>
  </div> 
</div>


---

## Další kroky

Zde je několik nápadů, co byste mohli vyzkoušet…

<div class="grid grid-cols-4">
  <div class="card">
    Podívat se na oficiální cermat úlohy <a href="https://prijimacky.cermat.cz/">příjmačky</a> a <a href="https://maturita.cermat.cz/">maturita</a>.
  </div>
  <div class="card">
    Trénovací PWA aplikace <a href="https://www.eforms.cz/">eforms</a> s podporou práce offline a podporou řešení úloh pomocí AI tlačítka. Případně oficiální trénovací aplikace <a href="https://tau.cermat.cz/">TAU</a>.
  </div>
  <div class="card">
    Studovat <a href="https://github.com/rsamec/cermat-quiz">zdrojové kódy</a> k aplikaci. Banka úloh výchází z oficiálních cermat úloh. Použité <a href="https://github.com/rsamec/cermat">formáty dat</a> k testovým úlohám.
  </div> 
  <div class="card">
    <a href="https://observablehq.com/@rsamec/cermat-vysledky-ai">Vizualizace výsledků</a> řešení testových úloh pomocí AI. <a href="https://github.com/rsamec/cermat/blob/main/lib/ai/quiz-solver.ts">Zdrojové kódy</a> k automatizovanému spuštění.
  </div>  
</div>

<style>

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 4rem 0 8rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  margin: 1rem 0;
  padding: 1rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

</style>
