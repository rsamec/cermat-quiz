---
toc: true
style: /assets/css/main.css
---
<div class="hero">
  <h1>Cermat úlohy</h1>
  <h2>Mimooficiální databanka úloh</h2>
  <a href="./inputs">Data</a>

  <video src="./assets/databanka.mp4" autoplay playsinline muted controls style="width: 100%;"></video>
</a>
</div>

```js
import { categories} from './utils/quiz-utils.js';
import { formatShortCode, formatSubject, formatPeriod, parseCode, baseMediaPublic } from './utils/quiz-string-utils.js';
const quizLangCategories = await FileAttachment("./data/quiz-lang-categories.json").json();
const quizGeneratedCategories = await FileAttachment("./data/quiz-categories.json").json();
const mathMetricsData = await FileAttachment("./data/math-metrics.json").json();

const mathMetricsCount = mathMetricsData.reduce((out,d) => {
  out.wordProblem.count+= d.wordProblem?.count ?? 0
  out.wordProblem.steps+= d.wordProblem?.steps ?? 0
  out.geometry.count+= d.geometry?.count ?? 0
  out.geometry.steps+= d.geometry?.steps ?? 0
  out.expression.count+= d.expression?.count ?? 0
  out.expression.steps+= d.expression?.steps ?? 0
  return out;
},{wordProblem:{count: 0, steps:0}, geometry:{count:0, steps:0}, expression:{count:0, steps:0}});


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
const code = "M9D-2025";
const notebookVideosData = await FileAttachment("./data/notebook-videos.json").json();
const notebookVideos = notebookVideosData[code] ?? [];


const videos = notebookVideos.map(d => {  
  return {
    video: `${baseMediaPublic}/${code}/${d.fileName}`,
    name: `Úloha ${d.id}`,
    id: d.id,
  }
})
```

## Zadání úloh

<div class="grid grid-cols-4" style="grid-auto-rows: auto;">
 ${subjects.map(subject => html`<div class="card">
    <h2><strong>${formatSubject(subject)}</strong></h2>
    <div class="v-stack v-stack--s">
      <div class="h-stack h-stack--l">
        <div>
          <span class="big">${quizQuestions.filter((d) => d.subject === subject).length.toLocaleString("en-US")}</span>
          <span>úloh</span>
        </div>
        <div>
          <span class="big">${subjectWithPeriods[subject].codes.length.toLocaleString("en-US")}</span>
          <span>testů</span>
        </div>
      </div>
      <div class="h-stack h-stack--m h-stack--wrap">
      ${subjectWithPeriods[subject].periods.map(period => html`<a class="h-stack h-stack--xs" href="./quiz-picker-${subject}-${period}">${formatPeriod(period)}<span><span></a>
        `)}
      </div>
    </div>
  </div>`)}
</div>

## Řešení úloh

<div class="grid grid-cols-4" style="grid-auto-rows: auto;">
  <div class="card">
    <h2><strong>Vyřešené slovní úlohy</strong></h2>
    <div class="v-stack v-stack--s">
      <div class="h-stack h-stack--l">
        <div>
          <span class="big">${mathMetricsCount.wordProblem.count}</span>
          <span>úloh</span>
        </div>
        <div>
          <span class="big">${mathMetricsCount.wordProblem.steps}</span>
          <span>kroků řešení</span>
        </div>
      </div>
      <a class="h-stack h-stack--xs" href="./word-problems-summary">Slovní úlohy<span><span></a>
    </div>
  </div>
  <div class="card">
    <h2><strong>Vyřešené konstrukční úlohy</strong></h2>
    <div class="v-stack v-stack--s">
      <div class="h-stack h-stack--l">
        <div>
          <span class="big">${mathMetricsCount.geometry.count}</span>
          <span>úloh</span>
        </div>
        <div>
          <span class="big">${mathMetricsCount.geometry.steps}</span>
          <span>kroků řešení</span>
        </div>
      </div>
      <a class="h-stack h-stack--xs" href="./math">Konstrukční úlohy<span><span></a>
    </div>
  </div>
  <div class="card">
    <h2><strong>Vyřešené výrazy a rovnice</strong></h2>
    <div class="v-stack v-stack--s">
    <div class="h-stack h-stack--l">
        <div>
          <span class="big">${mathMetricsCount.expression.count}</span>
          <span>úloh</span>
        </div>
        <div>
          <span class="big">${mathMetricsCount.expression.steps}</span>
          <span>kroků řešení</span>
        </div>
      </div>
      <a class="h-stack h-stack--xs" href="./math">Výrazi a rovnice<span><span></a>
    </div>
  </div>

</div>

## Tvorba vlastních výukových materiálů

**Hlavním cílem** projektu je **zdarma** poskytnout **kvalitní data pro tvorbu výukových materiálů** (videa, audia, pracovní listy, kvízů, kartiček, aplikací...)

### Příklad - matika 2025 - 2. náhradní termín

<div class="carousel carousel--scroll-markers carousel--inert">
${videos.map(({ video, name, id }, i) => html`<div class="carousel__slide" data-label=a${i}>
    <figure class="parallax-item" role="tabpanel">      
      <video src=${video} muted loop controls></video>
     <figcaption>
     <h2>${name}</h2>     
     </figcaption> </figure>
  </div>`)}
</div>


<div style="height:40px"></div>

<div class="tip" label="Notebook LM">
  Videa výše jsou vytvořena pomocí aplikace <a href="https://notebooklm.google.com/" target="_blank">NotebookLM</a> na základě <a href="/word-problems-M9D-2025"> dat</a> z banky úloh. 
  
  Pokud chcete vytvořit obdobné **vyukové materiály na míru** na pár kliků či prozkoumat další možnosti integrace <a href="/embedding">více informací</a>.
</div>

---

<div class="grid grid-cols-4" style="grid-auto-rows: auto;"> 
  <div class="card grow">
    <h1><strong>Strukturovná data</strong></h1>
    <div class="v-stack v-stack--m">
      <span>Databanka úloh výchází z oficiálních cermat úloh. Strukturovaná data zadání a řešení.</span>
      <a href="/inputs">Více informací</a>
    </div>
  </div>
  <div class="card grow">
    <h1><strong>Tisk</strong></h1>
     <div class="v-stack v-stack--m">
      <span>Tužka a papír pomáhá přemýšlení, učení a zapamatování. Psaní rukou není rozhodně jen pro milovníky historie. Podrhávejte, používejte zvýrazňovače, rýsujte a počítejte na papír. Papír nebo technologie?</span>
      <a href="/print">Více informací</a>
    </div>
  </div>
  <div class="card grow">
    <h1><strong>Rozbory úloh, vizualizace, videa</strong></h1>
     <div class="v-stack v-stack--m">
      <span>Rozbory řešení na úroveň jednotlivých kroků, strukturované myšlení pomocí dedukčních stromů. Jeden obrázek vydá za tisíc slov. Dobrá vizualizace usnadňuje pochopení úlohy.</span>
      <a href="/math-deduction">Více informací</a>
    </div>
  </div> 
  <div class="card grow">
    <h1><strong>Integrace</strong></h1>
    <div class="v-stack v-stack--m">
      <span>Možnost vložit do vlastních školních stránek. Vytvořit si vlastní grafickou podobu testu. Stavět vlastní aplikace.</span>
      <a href="/embedding">Více informací</a>
    </div>
  </div>
  <!-- <div class="card grow">
    <h1><strong>AI a automatizace</strong></h1>
     <div class="v-stack v-stack--m">
      <span>AI jako nástroj né jako řešení. V případě nouze použij ChatGTP tlačítko. Automatické řešení úloh pomocí AI.</span>
      <a href="/ai">Více informací</a>
    </div>
  </div> 
  <div class="card grow">
    <h1><strong>Vlastní sestavení testu</strong></h1>
     <div class="v-stack v-stack--m">
      <span>Naklikej si vlastní porci úloh. Výsledek si vytiskni nebo využij na online trénování.</span>
      <a href="/builder">Více informací</a>
    </div>
  </div> -->
</div>


---

## Další kroky

Zde je několik nápadů, co byste mohli vyzkoušet…

<div class="grid grid-cols-4">
  <div class="card">
    Podívat se na oficiální cermat úlohy <a href="https://prijimacky.cermat.cz/">příjmačky</a> a <a href="https://maturita.cermat.cz/">maturita</a>.
  </div>
  <div class="card">
    Trénovací PWA aplikace <a href="https://www.eforms.cz/">eforms</a> s podporou práce offline. Případně oficiální trénovací aplikace <a href="https://tau.cermat.cz/">TAU</a>.
  </div>
  <div class="card">
    Jak dopadla AI při řešení testů? Podívejte se na <a href="./ai">výsledky </a> všech úloh z databanky.
  </div>
  <div class="card">
     Mrkněte na <a href="https://github.com/rsamec/cermat-quiz">zdrojové kódy</a> k aplikaci. Databanka úloh výchází z oficiálních cermat úloh. Použité <a href="./inputs">formáty dat</a> k testovým úlohám.
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
