# Notes

## PDF generation
prepera PDFs
- test run print-by-columns.spec.ts
- npm run merge-pdf

add to source
- delete src/assets/pdf/<subject>-<period>/data.json
- node src/data/pdf-[subject]-[period].json.js --subject <subject> --period <period>

## Pocast prompt customization
- follow all the quiz questions from the beginning to the end
- do not solve using any equations with unknowns, do not introduce any variables x or y, follow the presented solutions
- add some jokes
- do not use czech language in the podcast


Na stránce https://www.cermatdata.cz je dostupná nová neoficiální data banka úloh a jejich řešení.

Data banka vychází z oficiálních cermat úloh a doplňuje je o řešení některých úloh ve formě strukturovaných dat.
- úlohy jako strukturovaná data - https://www.cermatdata.cz/inputs
  - markdown - zadání
  - json metadata - výsledky řešení, body, atd.
- řešení úloh jako strukturovaná data
  - slovní úlohy - řešení pomocí dedukčních stromů - https://www.cermatdata.cz/math-deduction
  - geometrie - konstrukční úlohy řešené krok po kroku - https://www.cermatdata.cz/math-geometry
  - matemické výrazy a rovnice - automatizovaně pomocí Microsoft Math API - krok po kroku - https://www.cermatdata.cz/math

Dále jsou na stránce inspirace a podrobné návody, jak lze data využívat
  - vytvoření vlastních aplikací - https://www.cermatdata.cz/embedding
  - automatizované řešení úloh pomocí AI - https://www.cermatdata.cz/ai
  - sestavení vlastních testů - https://www.cermatdata.cz/builder
  - tisk úloh - https://www.cermatdata.cz/print
  

|Predikát          |Atributy|Příklad|
|------------------|-------|-------|
|CONTAINER         |agent=Ája,quantity=2,entity=sešity|Ája má 2 sešity.|
|COMPARE           |agent=Ája,quantity=2,entity=sešity|Ája má 2 sešity.|
|COMPARE RATIO     |agentA=Ája,agentB=Honzík,quantity=7,entity=sešity|Ája má 7 krát více sešitů než Honzík.|
|COMPARE ANGLE     |agentA=alfa,agentB=beta,relationship=complementary|Alfa je doplňkový úhel k beta.|
|COMPARE DIFFERENCE|agentMinuend=celkem,agentSubtrahend=Honzík,quantity=7,entity=sešity|Rozdíl mezi sešity celkem a Honzíkem je 7 sešitů.|
|TRANSFER          |agentSender=Ája,agentReceiver=Honzík,quantity=7,entity=sešity|Ája dala 7 sešitů Honzíkovi.|
|RATIO             |whole=třída,part=chlapci,ratio=1/4|Ve třídě je 1/4 chlapců ze všech žáků.|
|RATIOS            |whole=třída,parts=[chlapci,dívky],ratios=[1,3]|Poměr chlapců a dívek ve třídě je 1 ku 3.|
|RATE              |agent=Ája,quantity=3,entity=Kč,entityBase=rohlík|Každý rohlík, který má Ája, stojí 3 Kč.|
|QUOTE             |agent=skupina,agent=dvojice,quantity=5|Skupina rozdělena na 5 dvojic.|
|SUM               |agentWhole=třída,partAgents=[chlapci,dívky],entityWhole=žáků|Počet chlapců a dívek dohromady dává počet žáků ve třídě.
|PRODUCT           |agentWhole=obsah obdélníku,partAgents=[šířka,délka],entityWhole=cm^2^|Obsah obdelníku je produktem výšky a šířky.|
|PROPORTION        |inverse=true,entities=[počet výrobků, počet pracovníků]|Mezi veličinami počet výrobků a počet pracovníků je nepřímá úměra.|
|UNIT              |unit=kg|Převěď na kilogramy.|
|GCD               |agent=tyč,entity=délka|Vypočítej největší možnou délku tyče.|
|LCD               |agent=skupina,entity=osob|Vzpočítej nejmenší možnou skupinu osob.|