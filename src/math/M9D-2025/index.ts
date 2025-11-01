import { commonSense, compRatio, cont, ctor, ctorRatios, ctorUnit, nthPart, rate, ratio, ratios, ctorLinearEquation, ctorOption, sum, contLength, dimensionEntity, comp, ctorComplement, evalExprAsCont, pythagoras, compRelativePercent, ctorDifference, compRelative, ctorRate, triangleArea, doubleProduct, cubeArea, cubeVolume, evalFormulaAsCont, formulaRegistry, tuple, contAngle, compAngle, ctorBooleanOption, contRightAngle, triangleAngle } from "../../components/math";
import { anglesNames, createLazyMap, deduce, deduceAs, last, to, toCont, toFrequency } from "../../utils/deduce-utils";

export default createLazyMap({
  1: () => stuha(),
  2: () => porovnani(),
  6.1: () => roboti().pomerBeden,
  6.2: () => roboti().pomerJizd,
  6.3: () => roboti().doba,
  8.1: () => ctverec().porovnani,
  8.2: () => ctverec().obvod,
  7.1: () => soutez().prvniKolo,
  7.2: () => soutez().druheKolo,
  11.1: () => uhly().a,
  11.2: () => uhly().b,
  11.3: () => uhly().c,
  12: () => krychle(),
  13: () => vlak(),
  14: () => brhlikLesni(),
  15.1: () => procenta().a,
  15.2: () => procenta().b,
  15.3: () => procenta().c,

})

function uhly() {
  const pravyUhel = contRightAngle();
  const zadany = contAngle("zadaný", 64)
  const alpha = deduceAs("trojúhelník KAS je rovnoramenný")(
    zadany,
    compAngle("zadaný", anglesNames.alpha, "isosceles-triangle-at-the-base")
  )
  const alfaABetaLabel = [anglesNames.alpha, anglesNames.beta].join(" a ")

  const SKB = deduce(
    zadany,
    compAngle("zadaný", "SKB", "complementary"),
  )
  const gamma = deduce(
    SKB,
    deduceAs(`trojúhelník SBK je rovnoramenný`)(
      last(SKB),
      compAngle(anglesNames.beta, "SKB", "isosceles-triangle-at-the-base")
    ),
    triangleAngle(anglesNames.gamma)
  )
  return {
    a: {
      deductionTree: deduce(
        alpha,
        ctorBooleanOption(64, "greater")
      )
    },
    b: {
      deductionTree: deduce(
        deduceAs(`thaletovo pravidlo -> trojúhelník ABK je pravoúhlý -> ${alfaABetaLabel} = 90`)(
          last(alpha),
          deduce(
            last(alpha),
            pravyUhel,
            triangleAngle(anglesNames.beta)
          ),
          sum(alfaABetaLabel)
        ),
        ctorBooleanOption(90, "greater")
      )
    },
    c: {
      deductionTree: deduce(
        deduce(
          deduce(
            gamma,
            last(alpha),            
            ctorDifference(`${anglesNames.gamma} - ${anglesNames.alpha}`)
          ),
          deduce(
            last(gamma),
            compAngle(anglesNames.delta, anglesNames.gamma, "supplementary")
          )
        ),
        ctorBooleanOption(0, "greater")
      )
    },
  }
}

function porovnani() {
  const vetsiLabel = "větší číslo";
  const mensiLabel = "menší číslo";

  return {
    deductionTree: deduce(
      to(
        commonSense("dvojnásobky dvou čísel se liší o 6, tak samotná čísla se musí lišit o 3."),
        comp(vetsiLabel, mensiLabel, 3, "")
      ),
      ratios("poměr", [mensiLabel, vetsiLabel], [4, 5]),
      nthPart(mensiLabel)
    )
  }
}

function stuha() {

  const celkem = contLength("stuha celkem", 3, "m")
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          celkem,
          deduce(
            ratio("stuha celkem", "1. dárek", 1 / 4),
            ctorComplement("zbytek")
          )
        ),
        deduce(
          ratio("zbytek", "2. dárek", 2 / 5),
          ctorComplement("3. dárek"),
        )
      ),
      ctorUnit("cm")
    )
  }
}

function roboti() {

  const entityTime = "doba"
  const unitTime = "hodina"
  const entity = "bedna";
  const entityBase = "počet jízd";

  const rateA = rate("robot A", 5, entity, entityBase);
  const rateB = rate("robot A", 3, entity, entityBase);


  const odvezenoA = deduce(
    cont("robot A", 50, entity),
    cont("robot A", 2, entityTime, unitTime),
    ctor("rate")
  )
  const odvezenoB = deduce(
    cont("robot B", 45, entity),
    cont("robot B", 1.5, entityTime, unitTime),
    ctor("rate")
  )

  const dobaPrace = deduce(
    cont("robot A", 36, entityTime, "min", { asFraction: true }),
    ctorUnit("h")
  )

  return {
    pomerBeden: {
      deductionTree:
        deduce(
          odvezenoA,
          odvezenoB,
          ctorRatios("poměr odvezeného množství beden", { useBase: true }),

        )
    },
    pomerJizd: {
      deductionTree: deduce(
        deduce(last(odvezenoA), rateA),
        deduce(last(odvezenoB), rateB),
        ctorRatios("poměr počtu jízd", { useBase: true }),
      )
    },
    doba: {
      deductionTree: deduce(
        deduce(
          dobaPrace,
          last(odvezenoA),
        ),
        deduce(
          last(dobaPrace),
          last(odvezenoB)
        ),
        sum("dohromady")
      )
    }
  }
}
function soutez() {
  const entityBase = { entity: "body" }
  const entity = "soutěžící"
  const agent = "soutěž"


  const celkem = cont(agent, 10, entity);
  const _8vs10 = comp("8-bodových", "10-bodových", - 1, entity)

  const _9 = cont("9-bodových", 5, entity);
  const _8 = deduce(
    deduce(
      celkem,
      _9,
      ctorDifference("8-bodových a 10-bodových dohromady")
    ),
    _8vs10,
    ctor("comp-part-eq")
  );

  const _10 = deduce(
    last(_8),
    _8vs10
  )
  return {
    prvniKolo: {
      deductionTree: deduce(
        deduce(
          toFrequency(_8, { agent, entityBase, baseQuantity: 8 }),
          toFrequency(_9, { agent, entityBase, baseQuantity: 9 }),
          toFrequency(_10, { agent, entityBase, baseQuantity: 10 }),
          sum("celkem")
        ),
        deduce(
          last(_8),
          _9,
          last(_10),
          sum("celkem")
        ),
        ctorRate(agent)
      )
    },
    druheKolo: {
      deductionTree: to(
        commonSense("nejmenší počet 10-bodových platí pro počty (0,5,5) v pořadí (8-bodových, 9-bodových, 10-bodových)"),
        commonSense("ostatní řešení získáme zvyšováním počtu 10-bodových a přesunem počtu z 9-bodových k 8-bodovým"),
        commonSense("(0,5,5)"),
        commonSense("(1,3,6)"),
        commonSense("(2,1,7)"),
        tuple("počty 9-bodových", [5, 3, 1].map(d => cont('9-bodových', d, entity)))

      )
    }
  }
}

function ctverec() {
  const dim = dimensionEntity()
  const ctverecLabel = "strana čtverce"

  const stranaTrojuhelnikLabel = "nejkratší strana pravoúhlého trojůhelníku"
  const stranaCtverec = contLength(ctverecLabel, 12);
  const zakladnaLichobeznik = contLength("kratší základna lichoběžníku", 2);
  const stranaTrojuhelnik = deduce(
    stranaCtverec,
    zakladnaLichobeznik,
    evalExprAsCont("(stranaCtverce - kratsiZakladna)/2", stranaTrojuhelnikLabel, dim.length)
  )
  const stranaLichobeznik = deduce(
    last(stranaTrojuhelnik),
    stranaCtverec,
    pythagoras("nejdelší stran lichoběžník", [ctverecLabel, stranaTrojuhelnikLabel])
  )
  return {
    porovnani: {
      deductionTree: deduce(
        deduce(
          stranaTrojuhelnik,
          stranaCtverec,
          triangleArea("odstřižené části - pravoúhlý trojůhelník")
        ),
        ...doubleProduct("odstřižené části (2 pravoúhlé trojůhelníky)")
      ),
    },
    obvod: {
      deductionTree: deduce(
        stranaLichobeznik,
        last(stranaLichobeznik),
        zakladnaLichobeznik,
        stranaCtverec,
        sum("lichoběžník")
      )
    }
  }
}

function krychle() {
  const dim = dimensionEntity();
  const malaLabel = "malá krychle";
  const velkaLabel = "velká krychle";
  const obsah = comp(velkaLabel, malaLabel, 42, dim.area)

  const stranaMala = toCont(deduce(
    cont(malaLabel, 36, dim.length.entity, dim.length.unit),
    cont(malaLabel, 12, "hran"),
    ctor("rate")
  ), { agent: malaLabel })

  const stranaVelka = deduce(
    deduce(
      deduce(
        last(stranaMala),
        cubeArea(malaLabel)
      ),
      obsah),
    evalFormulaAsCont(formulaRegistry.surfaceArea.cube, x => x.a, velkaLabel, dim.length)
  )

  return {
    deductionTree: deduce(
      deduce(
        deduce(stranaVelka, cubeVolume(velkaLabel)),
        deduce(stranaMala, cubeVolume(malaLabel))
      ),
      ctorOption("C", 37)
    )
  }
}

function vlak() {
  const entity = "vagón";

  const prvniKolej = cont("1.kolej", "x", entity)
  const prvniVsDruha = comp("2.kolej", "1.kolej", 3, entity)
  const druhaVsTreti = compRatio("2.kolej", "3.kolej", -2);
  const druhaKolej = deduce(
    prvniKolej,
    prvniVsDruha,
  );

  const prvniKolejVysledek = deduce(
    deduce(
      prvniKolej,
      druhaKolej,
      deduce(
        last(druhaKolej),
        druhaVsTreti
      ),
      sum("celkem")
    ),
    cont("celkem", 41, entity),
    ctorLinearEquation("1.kolej", { entity }, "x")
  )

  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            prvniKolejVysledek,
            prvniVsDruha,
          ),
          druhaVsTreti
        ),
        last(prvniKolejVysledek),
      ),
      ctorOption("E", 14)
    )
  }
}

function brhlikLesni() {
  const entity = "ptáci"
  const entityBase = "dílek"

  const jednotkaGrafu = deduce(
    deduce(
      cont("pěnkavy", 5, entityBase),
      cont("sýkory", 8, entityBase)
    ),
    comp("pěnkavy", "sýkory", -6, entity),
    ctorRate("jednotka grafu")
  )
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            jednotkaGrafu,
            cont("Jonáš", 3 + 2 + 4 + 1 + 2, entityBase)
          ),
          compRelative("Jonáš", "Beata", 1 / 5)
        ),
        deduce(
          cont("Beata", 2 + 4 + 3, entityBase),
          last(jednotkaGrafu)
        ),
        ctorDifference("brhlík lesní")
      ),
      ctorOption("A", 2)
    )
  }
}

function procenta() {
  const entity = "let"
  const zivotPredPrestehovanim = cont("život před přestěhováním do Plzně", 27, entity);

  const compareDvojceVsBratr = compRelativePercent("dvojče", "starší bratr", -40)
  return {
    a: {
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              ratio("celý život", "život v Plzni", 5 / 8),
              ctorComplement("život před přestěhováním do Plzně")
            ),
            zivotPredPrestehovanim
          ),
          zivotPredPrestehovanim,
          ctorDifference("život v Plzni")
        ),
        ctorOption("D", 45)
      )
    },
    b: {
      deductionTree: deduce(
        deduce(
          deduce(
            cont("základní škola", 84, entity),
            compRelativePercent("základní škola", "gymnázium", 75)
          ),
          ratios("poměr doby fungování", ["lyceum", "gymnázium"], [2, 3]),
          nthPart("lyceum")
        ),
        ctorOption("C", 32))
    },
    c: {
      deductionTree: deduce(
        deduce(
          deduce(
            deduce(
              compareDvojceVsBratr,
              compareDvojceVsBratr,
              ctorRatios("věk bratrů"),
            ),
            cont("věk bratrů", 99, entity)
          ),
          compareDvojceVsBratr
        ),
        ctorOption("B", 27)
      )
    }
  }
}