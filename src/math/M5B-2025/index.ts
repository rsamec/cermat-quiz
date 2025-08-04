import { commonSense, compRatio, compRelative, cont, ctor, ctorDifference, ctorOption, ctorRatios, nthPart, rate, ratio, ratios, sum, product, counter, ctorScaleInvert, ctorScale, ctorSlide, ctorSlideInvert, evalExprAsCont } from "../../components/math";
import { createLazyMap, deduce, last, lastQuantity, to, toCont } from "../../utils/deduce-utils";

export default createLazyMap({
  1.1: () => hledaneCisla().cislo1,
  1.2: () => hledaneCisla().cislo2,
  1.3: () => hledaneCisla().cisla3,
  3.1: () => koralky().celkem,
  3.2: () => koralky().porovnani4To2,
  3.3: () => koralky().cerneKoralky,
  4.1: () => restaurace().celkemStolu,
  4.2: () => restaurace().celkemMist,
  10: () => zahon().yellow,
  11: () => zahon().velvet,
  // 14.1: () => ctverce().obvodObrazec2,
  // 14.2: () => ctverce().obrazecWidthToLength
})

function hledaneCisla() {
  const entity = ""

  const unknownNumberLabel = "neznámé číslo"
  const prvniL = "první"
  const druhyL = "druhý"

  const soucet = deduce(
    cont("součet", 109, entity),
    evalExprAsCont("soucet / 2", { kind: 'cont', agent: "polovina součtu", entity }),
  )


  const rozdil = deduce(
    cont("rozdíl", 13, entity),
    evalExprAsCont("rozdil / 2", { kind: 'cont', agent: "polovina součtu", entity }),
  )

  return {
    cislo1: {
      deductionTree: deduce(
        deduce(
          deduce(
            cont("známý výsledek", 20, entity),
            counter("zdojnásobení", 2),
            ctorScaleInvert("číslo bez násobení")
          ),
          cont("opak přičtené číslo", 3, entity),
          ctorDifference("číslo bez přičteného čísla")
        ),
        counter("dělení 7", 7),
        ctorScale("neznáné číslo bez dělení")
      )
    },
    cislo2: {
      deductionTree: deduce(
        deduce(
          compRelative("zvětšení", unknownNumberLabel, -1 / 2),
          ctorRatios("známý výsledek")
        ),
        cont("známý výsledek", 198, entity),
        nthPart(unknownNumberLabel)
      )
    },
    cisla3: {
      deductionTree: to(
        commonSense("abychom zachovali součet a zároveň vzniknul požadovaný rozdíl"),
        commonSense("přičteme polovinu rozdílu"),
        deduce(soucet, rozdil, ctorSlide("první neznámé číslo")),
        commonSense("odečteme polovinu rozdílu"),
        deduce(last(soucet), last(rozdil), ctorSlideInvert("druhé neznámé číslo")),
      )
    }
  }
}

function koralky() {
  const entity = "korálky"

  const skupina3 = cont(`3. skupina`, 32, entity);
  const groupRatioFactory = (num: number) => compRatio(`${num}. skupina`, `${num - 1}. skupina`, 4);

  const skupina2 = deduce(
    skupina3,
    groupRatioFactory(3),
  )
  const skupina1 = deduce(
    last(skupina2),
    groupRatioFactory(2),
  )
  const skupina4 = deduce(
    skupina3,
    groupRatioFactory(4),
  )

  const celkem = deduce(
    skupina4,
    skupina3,
    skupina2,
    skupina1,
    sum("celkem")
  )
  const name = 'skupina barev (černé a bílý)';

  const colorQuota = deduce(
    last(skupina4),
    cont(name, 5, ""),
    ctor("quota")
  )
  return {
    celkem: {
      deductionTree: celkem
    },
    porovnani4To2: {
      deductionTree: deduce(
        last(skupina4),
        last(skupina2),
        ctor('comp-ratio')
      )
    },
    cerneKoralky: {
      deductionTree: deduce(
        last(skupina4),
        to(
          colorQuota,
          commonSense("každá skupina obsahuje 1 bílý"),
          commonSense("zbytek obsahuje 1 bílý"),
          cont("bílé", lastQuantity(colorQuota) + 1, entity),
        ),
        ctorDifference("černé")
      )
    }
  }
}
function restaurace() {
  const entity = 'host'
  const entityBase = "stůl"

  const bigLabel = "velké stůl";
  const mediumLabel = "standardní stůl";
  const smallLabel = "malé stůl"

  const bigRate = rate(bigLabel, 4, entity, entityBase);
  const mediumRate = rate(mediumLabel, 3, entity, entityBase);
  const smallRate = rate(smallLabel, 2, entity, entityBase);


  const celkemStolu = deduce(
    ratio("restaurace", "rezervace", 1 / 4),
    cont("rezervace", 9, entityBase),
  );

  const medium = deduce(
    last(celkemStolu),
    ratio("restaurace", mediumLabel, 1 / 3)
  )
  const small = deduce(
    last(celkemStolu),
    ratio("restaurace", smallLabel, 1 / 2)
  )

  const big = deduce(
    last(celkemStolu),
    deduce(
      last(small),
      last(medium),
      sum("dohromady")
    ),
    ctorDifference(bigLabel)
  )


  return {
    celkemStolu: {
      deductionTree: celkemStolu
    },
    celkemMist: {
      deductionTree: deduce(
        deduce(small, smallRate),
        deduce(medium, mediumRate),
        deduce(big, bigRate),
        sum("celkem")
      )
    }
  }
}

function zahon() {
  const entity = "rostlina"
  const entityYellow = "žlutá rostlina"
  const entityVelvet = "fialová rostlina"
  const entityBase = "malý trojúhleníkový záhon"
  const strany = cont("záhon", 3, "strana")
  const subZahon = cont("po obvodu ke každé straně", 3, entityBase)
  const rohove = cont("rohové", 3, entity);
  const celkem = cont("záhon celkem", 39, entity);

  return {
    yellow: {
      deductionTree: deduce(
        to(
          deduce(
            to(
              deduce(
                deduce(
                  celkem,
                  rohove,
                  ctorDifference("záhon")
                ),
                strany,
                ctor("rate")
              ),
              commonSense("2 z těchto rostli jsou fialové a zároveň jsou na každé straně 2 rohové"),
              cont("po obvodu ke každé straně", 12, entityYellow)
            ),
            subZahon,
            ctor("rate")
          ),
          commonSense("vzor žluté -> 1 + 2 + 3 + 4 = 10"),
          cont("záhon", 10, entityYellow)
        ),
        ctorOption("C", 10)
      )
    },
    velvet: {
      deductionTree: deduce(
        deduce(
          to(
            commonSense("vzor žluté -> 1 + 2 + 3 + 4 = 10"),
            commonSense("vzor fialové -> 1 + 2 + 3 + 4 + 5 = 15"),
            rate("záhon", 15, entityVelvet, entityBase)
          ),
          cont("záhon", 3, entityBase)
        ),
        ctorOption("B", 45)
      )
    }
  }
}

function ctverce() {
  const entity = "délka";
  const unit = "cm";

  const entityBase = "strana";

  const entitySquare = "čtverec"

  const obrazec1 = "1. obrazec"
  const obrazec2 = "2. obrazec"
  const obrazec3 = "3. obrazec"

  const obvod1 = cont(obrazec1, 80, entity, unit)
  const ctverec1PocetStran = cont(obrazec1, 4, entityBase)
  const ctverec2PocetStran = cont(obrazec2, 4, entityBase)

  const matchSiteLabel2 = "strana 1. obrazce = 5 světle šedé čtverce"
  const tempMatchSiteLabel2 = "2. obrazec - 4 tmavě šedé čtverce =  6 švětle šedé čtverce"
  const matchSiteLabel3 = "strana 2. obrazce = 6 tmavě šedé čtverce"
  const tempMatchSiteLabel3 = "kratší strany 3. obrazce  = 5 světle šedé čtverce"



  const strana1 = toCont(deduce(
    obvod1,
    ctverec1PocetStran,
    ctor("rate")
  ), { agent: matchSiteLabel2 })

  const strana1Add = deduce(
    last(strana1),
    cont(matchSiteLabel2, 5, entitySquare),
    ctor('rate')
  )

  const strana2 = deduce(
    deduce(
      strana1,
      strana1Add,
      ctorSlide(tempMatchSiteLabel2)
    ),
    ratios(matchSiteLabel3, [tempMatchSiteLabel2, "bílý čtverec"], [4, 1])
  )

  const widthAdd = deduce(
    last(strana2),
    cont(matchSiteLabel3, 6, entitySquare),
    ctor('rate'))

  const width3 = deduce(
    last(strana2),
    widthAdd,
    ctorSlide(tempMatchSiteLabel3)
  )


  return {
    obvodObrazec2: {
      deductionTree: deduce(
        strana2,
        ctverec2PocetStran,
        product(obrazec2)
      )
    },
    obrazecWidthToLength: {
      deductionTree: deduce(
        deduce(
          last(strana2),
          deduce(
            last(width3),
            cont(tempMatchSiteLabel3, 5, entitySquare),
            ctor('rate')
          ),
          product("delší strana 3. obrazce")
        ),
        width3
      )
    }
  }
}