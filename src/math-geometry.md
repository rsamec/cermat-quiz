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

# Řešení konstrukčních úloh

Použita knihovna <a href="https://rulerandcompass.org/">RAC - Ruler and Compass</a> k vytvoření gemoetrických konstrukcí pomocí operací simulující použití pravítka a kružítka.

Konstrukční úloha je rozdělena na části

 - zadání úlohy - kalibrace úlohy, dle obrázku vytvoříme geometrickou konstrukci, která odpovídá zadání (libovoná velikost konstrukce, ale vždy zachovat proporci mezi objekty)
 - kroky řešení
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


## Playground k vyzkoušení

<iframe width="100%" height="376" frameborder="0"
  src="https://observablehq.com/embed/@jsamec/matika-9?cells=q9"></iframe>

<iframe width="100%" height="376" frameborder="0"
  src="https://observablehq.com/embed/@jsamec/matika-9?cells=q10"></iframe>

<iframe width="100%" height="376" frameborder="0"
  src="https://observablehq.com/embed/@jsamec/matika-9?cells=d8"></iframe>

Další příklady řešení konstrukční úloh lze nalézt [zde](https://observablehq.com/@jsamec/matika-9).

