---
footer: false
pager: true
toc: true
---
<style>
  .description {
    font-size: 12px;
    font-style: italic;
  }
 
</style>
```js
import { formatCode, parseCode} from './utils/quiz-string-utils.js';
import { unique, download } from "./utils/common-utils.js";
import wordProblems from './math/word-problems.js';

const quizGeneratedCategories = await FileAttachment("./data/quiz-categories-gemini-2.5-flash.json").json();



const wordProblemsKeyValuePairs = Object.entries(wordProblems).sort(([fKey],[sKey]) => {
  const f = parseCode(sKey);
  const s = parseCode(fKey);
  if (f.period === s.period){
    return f.year - s.year
  }
  return f.period - s.period;  
}).map(([key,value]) => {
  const ids = Object.keys(value).map(d => d.split('.')[0]).filter(unique).sort((f,s) => f - s)
  const categoryMap =  new Map(quizGeneratedCategories[key].questions.map(d => [d.id,d]));
  return [key,ids, categoryMap]
}
);
```

# Řešení slovních úloh

Slovní úlohy jsou řešeny rozložením na podproblémy, které jsou řešitelné pomocí jednoduchých početních operacích.

<div class="tip" label="Řešení pouze logickou úvahou">
  Žádné zavádění proměných. Žádné sestavování rovnic. Žádné složité výpočty.
</div>


${wordProblemsKeyValuePairs.map(([code, problems, categoryMap]) => html`<h3><a href="solu-${code}">${formatCode(code)}</a> - <a href="word-problems-${code}"><i class="fa-brands fa-markdown"></i></a> <a  href="word-problems-tldr-${code}"><i class="fa fa-draw-polygon"></i></a></h3></div><ul>${
  problems.map(key => html`<li><a href="./word-problem-${code}-n-${key}">${categoryMap.has(key) ? `${key}. ${categoryMap.get(key).name}` : `Řešení úloha ${key}`}</a><div class="description">${categoryMap.get(key).summary}</div></li>`
)}</ul>`)}


## Jak je to uděláno?

Řešení je vytvořeno jako dedukční strom. [více podrobností](/math-deduction)

Ke každé úloze lze zobrazit různé reprezentace dedukčního stromu
- textový strom - **shora dolů** kompaktní textový zápis, kořen představuje konečný výsledek
- dedukční strom - **zdola nahoru** - vizuální strom, který umožňuje zobrazovat i grafické prvky
- textový chat - **plochý seznam kroků řešení úlohy** - každý krok má strukturu otázka, vstupy a vyvozený závěr spolu s numerickým výpočtem
- chat - **grafický chat** - oddělení otázky a numerického výpočtu
- chat dialog - **interaktivní chat** - rozhodovačka po jednotlivých krocích s nutností volby z nabízených možností
- video - animace průchodu stromem

<div class="tip" label="Rozhodovačka">  
  Čtení samo o sobě je silný nástroj pro rozvoj myšlení, ale když se k němu přidají interaktivní prvky (např. dotazy), posouvá se jeho vliv na ještě vyšší úroveň.

  Vyzkoušej <b>interaktivní rozhodovačku</b> ve formě chatu po jednotlivých krocích s nutností volby z nabízených možností.
</div>

Propojení s AI - je vygenerován jednoduchí prompt, který může obsahovat zadání i textové řešení úlohy
- smart řešení - prompt na převedení heslovitého řešení do srozumitelnější podoby pro uživatele
- generování více příkladů - prompt na vytvoření obdobních úloh v jiné doméně
- audio - generovaný pomocí <a href="https://notebooklm.google.com/"><i class="fa-brands fa-google"></i> NotebookLM</a>

<div class="tip" label="Poslechni si podcast">
  Poslech vyžaduje aktivní zapojení a schopnost soustředit se na obsah. Protože audio neposkytuje vizuální podněty, posluchač si musí sám <b>vytvářet mentální obrazy</b> na základě slyšeného obsahu.
  
  Podcast je v angličtině, což <b>podporuje abstraktní myšlení</b> a vyžadují přemýšlení na více úrovních: nejen o číslech a vzorcích, ale i o jejich jazykovém vyjádření.
</div>

