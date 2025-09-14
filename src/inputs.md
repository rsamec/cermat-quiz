---
title: Data
footer: false
pager: true
toc: true
---
```js
import { baseDomain, baseDomainPublic, formatSubject, formatPeriod, formatShortCode} from './utils/quiz-string-utils.js';
import { quizes } from "./utils/quiz-utils.js";
```

# Datové formáty

Databanka úloh výchází z oficiálních cermat úloh. Použité formáty dat k testovým úlohám.
- markdown - testové zadání
- json - meta data - klíč správných řešení, body, ...

<div class="caution" label="Upozornění">
  Využití dat je limitováno doržením <a href="https://prijimacky.cermat.cz/files/files/CZVV_pravidla-vyuziti-webstrankyn.pdf">CERMAT licence</a>.
</div>
<!-- 
Pro postupy řešení matematických úloh (ve formátu json)
- slovní úlohy - dedukční stromy - *připravováno*
- výrazy a rovnice - kroky z úpravami výrazů a rovnic
- konstruční úlohy - kroky z konstrukcí - *připravováno* -->


## Seznam dat v bance úloh

${quizes.map(({subject, period, codes}) => html`<h3>${formatSubject(subject)} ${formatPeriod(period)}</h3> <ul>${
  codes.map(code => html`<li>${formatShortCode(code)}<ul><li><a class="h-stack h-stack--s h-stack-items--center" href="${baseDomainPublic}/${subject}/${period}/${code}/index.md"><i class="fa-brands fa-markdown"></i>testové zadání</a></li><li><a class="h-stack h-stack--s h-stack-items--center" href="${baseDomain}/generated/${code}.json"><i class="fa-brands fa-js"></i>metadata</a></li>${false ? html`<li><a download class="h-stack h-stack--s h-stack-items--center" href="/data/math-answers-${code}.json"><i class="fa-brands fa-js"></i>výrazy a rovnice</a></li>`:''}</ul></li>`
)}</ul>`)}


<div class="tip" label="Hlášení chyb">
  Databanka je spravována na <a href="https://github.com/rsamec/cermat"><i class="fa-brands fa-github"></i> github</a>.
  V případě že narazíte na chybu v úloze, opravte chybu svépomocí <a href="https://github.com/rsamec/cermat/pulls" target="_blank">PR</a> nebo nahlaste <a href="https://github.com/rsamec/cermat/issues">chybu</>.
</div>

## Příklad zadání (markdown)

```md

VÝCHOZÍ TEXT K ÚLOZE 4
===
> Petr se Janě před celou třídou posmíval, že má nemoderní mobil a nosí hnusné oblečení,
> a pak se divil, když mu řekla, že se chová jako blbec. Zkrátka *****.

# 4 Která z následujících možností obsahuje ustálené slovní spojení vystihující situaci ve výchozím textu, a patří tedy na vynechané místo (*****) v textu?
- [A] na děravý pytel nová záplata
- [B] na hrubý pytel hrubá záplata
- [C] na hrubý pytel jemná záplata
- [D] na děravý pytel děravá záplata


# 5 Rozhodněte o každé z následujících vět, zda je zapsána pravopisně správně (A), nebo ne (N).
## 5.1 Spoluviníka toho zločinného spiknutí zřejmě nikdo neodhalí. 
## 5.2 Vjezd do areálu výstaviště se nachází hned za kameným mostem. 
## 5.3 V tomto patře jsou kanceláře s výhledem do ulice a nezbitné zázemí. 
## 5.4 Své úspory vynaložil na vybudování záchranné stanice pro zvířata v nouzi. 


```


## Příklad metadata (json)

```ts run = false
  group({
    1: option("B"),
    2: option("D"),
    3: option("D"),
    4: option("B"),
    5: group({
      5.1: optionBool(true),
      5.2: optionBool(false),
      5.3: optionBool(false),
      5.4: optionBool(true),
    }, tasks4Max2Points),
    6: group({
      6.1: option("E"),
      6.2: option("B"),
      6.3: option("D"),
    }),
    7: group({
      7.1: wordsGroup({ podmět: 'kousky', přísudek: 'se objeví' }),
      7.2: wordsGroup({ podmět: 'deště (a) záplavy', přísudek: 'zničily' }),
    }),
  })
```

[Více podrobnosti k datovým formátům](https://github.com/rsamec/cermat)