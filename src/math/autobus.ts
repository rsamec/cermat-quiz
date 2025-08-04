import { comp, compRatio, cont, ctor, ctorDelta } from "../components/math.js";
import { deduce } from "../utils/deduce-utils.js";

export function autobus() {
  const entity = "lidí"
  const outA = cont("vystoupili A", 0, entity)
  const outB = cont("vystoupili B", 2, entity)
  const outC = cont("vystoupili C", 4, entity)
  const outE = cont("vystoupili E", 13, entity)


  const inD = cont("nastoupili D", 6, entity)

  const compB = compRatio("nastoupili B", "vystoupili B", 2);
  const compD = compRatio("nastoupili D", "vystoupili D", 2);


  // const outD = cont("vystoupili D", inD.quantity / 2, entity)
  // const inB = cont("nastoupili B", outB.quantity * 2, entity)

  const startLabel = "nástupní";
  const endLabel = "konečná";
  const autobusL = "autobus";

  //const start = cont(startLabel, 0, entity)
  const end = cont(endLabel, 0, entity)
  const AB = cont(`${autobusL} AB`, 7, entity);

 
  const deltaB = deduce(deduce(deduce(compB, outB), outB), ctorDelta(`${autobusL} BC`))
  const deltaD = deduce(deduce(inD, deduce(compD, inD)), ctorDelta(`${autobusL} CD`))



  const BC = deduce(AB, deltaB)
  const DE = cont(`${autobusL} DE`, outE.quantity, entity);
  const CD = deduce(deltaD, DE)
  const deltaC = deduce(BC, CD, ctor("delta"));
  const inC = deduce(outC, deduce(deltaC, comp(`nastoupili C`, `vystoupili C`, null, entity)))



  return {
    deductionTree: inC, template: () => `
Na zastávce B nastoupilo do autobusu 2x více lidí, než z něj vystoupilo. Totéž na zastávce D.
|          | A | B | C | D | E |
|:--------:|:-:|:-:|:-:|:-:|:-:|    
|vystoupili| 0 | 2 | 4 |   |13 |
|nastoupili|   |   |   | 6 | 0 |
|odjeli    | 7 |   |   |   | X |

Kolik lidí nastoupilo na zastávce C?
` }
}

export function autobus2() {
  const entity = "lidí"
  const entityMale = "muz"
  const entityFemale = "zena"
  const startLabel = "nástupní";
  const endLabel = "konečná";
  const autobusL = "autobus";

  const outFemaleB = cont("vystoupili B", 1, entityFemale)
  const outFemaleD = cont("vystoupili D", 3, entityFemale)
  const outFemaleE = cont("vystoupili E", 2, entityFemale)

  const femaleAB = cont(`${autobusL} AB`, 2, entityFemale);
  const femaleBC = cont(`${autobusL} BC`, 4, entityFemale);

  const outMaleC = cont("vystoupili C", 3, entityMale)
  const outMaleD = cont("vystoupili D", 2, entityMale)
  const outMaleE = cont("vystoupili E", 2, entityMale)
  const inMaleD = cont("nastoupili D", 1, entityMale)
  const inMaleE = cont("nastoupili E", 2, entityMale)

  const maleAB = cont(`${autobusL} AB`, 3, entityMale);
  const maleBC = cont(`${autobusL} BC`, 5, entityMale);


  const deltaMaleD = deduce(deduce(inMaleD, outMaleD), ctorDelta(`${autobusL} CD`))
  const deltaMaleE = deduce(deduce(inMaleE, outMaleE), ctorDelta(`${autobusL} DE`))

  const end = cont(endLabel, 0, entity)



  const maleDE = cont(`${autobusL} DE`, outMaleE.quantity, entityMale);
  const maleCD = deduce(deltaMaleD, maleDE);

  const deltaMaleC = deduce(maleBC, maleCD, ctor("delta"));
  const inMaleC = deduce(outMaleC, deduce(deltaMaleC, comp(`nastoupili C`, `vystoupili C`, null, entityMale)))



  return {
    deductionTree: inMaleC, template: () => `
|          |     A         |       B       |       C       |         D     |      E        |
|:--------:|:-------------:|:-------------:|:-------------:|:-------------:|:-------------:|    
|vystoupili|               |0 (muž) 1 (žen)|3 (muž) 0 (žen)|2 (muž) 3 (žen)|2 (muž) 2 (žen)|
|nastoupili|               |               |               |1 (muž) 0 (žen)|               |
|odjeli    |3 (muž) 2 (žen)|5 (muž) 4 (žen)|               |               |       X       |

Kolik lidí mužů nastoupilo na zastávce C?`}
}