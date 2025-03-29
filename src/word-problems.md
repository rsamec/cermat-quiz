---
footer: false
pager: true
toc: true
---

```js
import { baseDomain, baseDomainPublic, formatSubject, formatPeriod, formatCode, formatShortCode} from './utils/quiz-string-utils.js';
import { unique } from "./utils/common-utils.js";
import { quizes } from "./utils/quiz-utils.js";
import mdPlus from './utils/md-utils.js';
import wordProblems, {  } from './math/word-problems.js';

const wordProblemsKeyValuePairs = Object.entries(wordProblems).map(([key,value]) => [key,Object.keys(value).map(d => d.split('.')[0]).filter(unique).sort((f,s) => f - s)]);
```

# Řešení slovních úloh

Slovní úlohy jsou řešeny rozložením na podproblémy, které jsou řešitelné pomocí jednoduchých početních operacích.

<div class="tip" label="Řešení pouze logickou úvahou">
  Žádné zavádění proměných. Žádné sestavování rovnic. Žádné složité výpočty.
</div>


${wordProblemsKeyValuePairs.map(([code, problems]) => html`<h3>${formatCode(code)}</h3><ul><audio src="/assets/math/${code}.mp3" autoplay playsinline muted controls style="min-width: 100px;"></audio>${
  problems.map(key => html`<li><a href="./word-problem-${code}-n-${key}">Řešení úloha ${key}</a></li>`
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
  
  Navíc je podcast v angličtině, což <b>podporuje abstraktní myšlení</b>. Matematické pojmy (ratio, proportion,...) v cizím jazyce vyžadují přemýšlení na více úrovních: nejen o číslech a vzorcích, ale i o jejich jazykovém vyjádření.
</div>

