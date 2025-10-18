import { commonSense, compRatio, cont, ctor, ctorRatios, ctorUnit, nthPart, rate, ratio, ratios, ctorLinearEquation, ctorOption, sum, contLength, productArea, dimensionEntity, comp, ctorComplement, evalExprAsCont, pythagoras, alligation, compRelativePercent, ctorDifference, compRelative, ctorRate, evalFormulaAsCont, formulaRegistry } from "../../components/math";
import { createLazyMap, deduce, last, to, toCont } from "../../utils/deduce-utils";

export default createLazyMap({
  1: () => stuha(),
  2: () => porovnani(),
  6.1: () => roboti().pomerBeden,
  6.2: () => roboti().pomerJizd,
  6.3: () => roboti().doba,
  8.1: () => ctverec().porovnani,
  8.2: () => ctverec().obvod,
  12: () => krychle(),
  13: () => vlak(),
  14: () => brhlikLesni(),
  15.1: () => procenta().a,
  15.2: () => procenta().b,
  15.3: () => procenta().c,

})

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
  const entity = "soutěžící"
  const agent = "soutěž"
  const celkem = cont(agent, 10, entity);
  return {
    deductionTree:

      deduce(
        cont("průměr", 9.5, "body"),
        cont("8 bodů", 8, "body"),
        cont("10 bodů", 10, "body"),
        alligation("poměr")

      )
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
        stranaTrojuhelnik,
        stranaCtverec,
        productArea("odstřižené části (2 pravoúhlé trojůhelníky)")
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
  const hrany = comp(velkaLabel, malaLabel, 36, dim.length)

  const stranaMala = toCont(deduce(
    cont(malaLabel, 36, dim.length.entity, dim.length.unit),
    cont(malaLabel, 12, "hran"),
    ctor("rate")
  ), { agent: malaLabel })

  const stranaVelka = deduce(
    deduce(
      deduce(
        last(stranaMala),
        evalFormulaAsCont(formulaRegistry.surfaceArea.cube, x => x.S, malaLabel, dim.area)
      ),
      obsah),
    evalFormulaAsCont(formulaRegistry.surfaceArea.cube, x => x.a, velkaLabel, dim.length)
  )

  return {
    deductionTree: deduce(
      deduce(
        deduce(stranaVelka, evalFormulaAsCont(formulaRegistry.volume.cube, x => x.V, velkaLabel, dim.volume)),
        deduce(stranaMala, evalFormulaAsCont(formulaRegistry.volume.cube, x => x.V, malaLabel, dim.volume))
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