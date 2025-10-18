import { commonSense, compRatio, compRelative, cont, ctor, ctorDifference, ctorOption, ctorRatios, nthPart, rate, ratio, ratios, sum, product, counter, ctorScaleInvert, ctorScale, ctorSlide, ctorSlideInvert, evalExprAsCont, comp, ctorBooleanOption, ctorUnit, contLength, contArea, dimensionEntity } from "../../components/math";
import { createLazyMap, deduce, deduceAs, last, lastQuantity, to, toCont } from "../../utils/deduce-utils";

export default createLazyMap({
  1.1: () => hledaneCisla().cislo1,
  1.2: () => hledaneCisla().cislo2,
  1.3: () => hledaneCisla().cisla3,
  // 2.1: () => prevody().delka,
  // 2.2: () => prevody().hmotnost,
  // 2.3: () => prevody().cas,
  3.1: () => koralky().celkem,
  3.2: () => koralky().porovnani4To2,
  3.3: () => koralky().cerneKoralky,
  4.1: () => restaurace().celkemStolu,
  4.2: () => restaurace().celkemMist,
  5.1: () => lepeniCtvercu().nejdelsiMoznaStrana,
  5.2: () => lepeniCtvercu().pocetKombinaci,
  5.3: () => lepeniCtvercu().nejvetsiMoznyObsah,
  6.1: () => cislaNaTabuly().rozdil,
  6.2: () => cislaNaTabuly().cislo,
  8.1: () => grafPocetMinci().vera,
  8.2: () => grafPocetMinci().pavelAVeraVsTomas,
  8.3: () => grafPocetMinci().vsechnyDeti,
  10: () => zahon().yellow,
  11: () => zahon().velvet,
  14.1: () => ctverce().obvodObrazec2,
  14.2: () => ctverce().obrazecWidthToLength
})


function prevody() {
  const entityDelka = "délka"
  const entityHmotnost = "hmotnost"
  const entityCas = "čas"
  return {
    delka: {
      deductionTree: deduce(
        deduce(
          deduce(
            cont("20m", 20, entityDelka, "m"),
            ctorUnit("dm")
          ),
          deduce(
            deduce(
              cont("18m", 18, entityDelka, "m"),
              ctorUnit("dm")
            ),
            cont("15dm", 15, entityDelka, "dm"),
            ctorDifference("levá strana")
          ),
          ctorDifference("rozdíl v dm")
        ),
        ctorUnit("cm")
      )
    },
    hmotnost: {
    },
    cas: {
    },

  }
}
function lepeniCtvercu() {
  const dim = dimensionEntity();
  return {
    nejdelsiMoznaStrana: {
      deductionTree: deduceAs("obdelník s nejdelší možnou stranu vytvoříme tak, že nalepíme čtverečky do jedná řady za sebou")
        (
          deduce(
            contLength("obvod", 18),
            contLength("2 kratší strany", 2),
            ctorDifference("zbytek na 2 delší strany")
          ),
          evalExprAsCont("zbytekKRozdeleni / 2", "nejdelší možná strana", dim.length)
        )
    },
    pocetKombinaci: {
      deductionTree: to(
        commonSense("obvod obdelníku musí být 18, resp. součet stran musí být 9"),
        commonSense("možnosti rozměrů stran: 1+8, 2+7, 3+6, 4+5"),
        commonSense("možnosti obsahů: 1x8=8, 2x7=14, 3x6=18, 4x5=20"),
        counter("možnosti obsahů", 4)
      )
    },
    nejvetsiMoznyObsah: {
      deductionTree: to(
        commonSense("vybere obdelní se stranamy 4x5=20"),
        contArea("největší možný obsah", 20)
      )
    }
  }
}
function hledaneCisla() {
  const entity = ""

  const unknownNumberLabel = "neznámé číslo"
  const soucet = deduce(
    cont("součet", 109, entity),
    evalExprAsCont("soucet / 2", "polovina součtu", { entity }),
  )


  const rozdil = deduce(
    cont("rozdíl", 13, entity),
    evalExprAsCont("rozdil / 2", "polovina součtu", { entity }),
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
      deductionTree: deduceAs("abychom zachovali součet a zároveň vzniknul požadovaný rozdíl")(
        deduceAs("přičteme polovinu rozdílu")(
          soucet, rozdil, ctorSlide("první neznámé číslo")),
        deduceAs("odečteme polovinu rozdílu")(
          last(soucet), last(rozdil), ctorSlideInvert("druhé neznámé číslo")),
        ctor("tuple")
      ),
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
function grafPocetMinci() {
  const veraLabel = "Věra"
  const pavelLabel = "Pavel"
  const tomasLabel = "Tomáš"
  const celkemLabel = "všichni děti"

  const vera = Object.entries({
    "leden": 7,
    "únor": 3,
    "březen": 2,
    "duben": 3
  }).map(([key, value], i) => counter(`${veraLabel} za ${key}`, value))

  const pavel = Object.entries({
    "leden": 2,
    "únor": 5,
    "březen": 7,
    "duben": 2
  }).map(([key, value], i) => counter(`${pavelLabel} za ${key}`, value))

  const tomas = Object.entries({
    "leden": 4,
    "únor": 3,
    "březen": 3,
    "duben": 5
  }).map(([key, value], i) => counter(`${tomasLabel} za ${key}`, value))

  const celkem = Object.entries({
    "leden": 13,
    "únor": 11,
    "březen": 12,
    "duben": 10
  }).map(([key, value], i) => counter(`${celkemLabel} za ${key}`, value))

  return {
    vera: {
      deductionTree: deduce(
        deduce(
          vera[0],
          deduce(
            vera[1],
            vera[2],
            vera[3],
            sum("tři měsíce")
          )
        ),
        ctorBooleanOption(0)
      )
    },
    pavelAVeraVsTomas: {
      deductionTree: deduce(
        deduce(
          deduce(
            vera[1],
            pavel[1],
            sum("Pavel a Věra")
          ),
          tomas[1],
          ctor("comp-ratio")
        ),
        ctorBooleanOption(3, "closeTo", { asFraction: true })
      )
    },
    vsechnyDeti: {
      deductionTree: deduce(
        deduce(
          tomas[3],
          deduce(
            celkem[0],
            celkem[1],
            celkem[2],
            celkem[3],
            sum("celkem za 4 měsíce")
          ),
          ctor("comp-ratio")
        ),
        ctorBooleanOption(1 / 9, "closeTo", { asFraction: true })
      )
    },
  }
}
function cislaNaTabuly() {
  const entity = "hodnota"

  const rozdil = deduce(
    deduce(
      cont("desitky", 10, entity),
      counter("počet", 3),
      product("Karel větší než Mirka o")
    ),
    deduce(
      cont("jednotky", 1, entity),
      counter("počet", 2),
      product("Karel menší než Mirka o")
    ),
    ctorDifference("rozdíl mezi Karel a Mirka")
  )
  return {
    rozdil: {
      deductionTree: rozdil
    },
    cislo: {
      deductionTree: deduce(
        deduce(
          last(rozdil),
          ratio("Karel", "rozdíl mezi Karel a Mirka", 1 / 3)
        ),
        last(rozdil),
        ctorDifference("Mirka")
      )
    },

  }
}

function ctverce() {

  const entityBase = "strana";
  const entitySquare = "čtverec"

  const obrazec1 = "1. obrazec"
  const obrazec2 = "2. obrazec"
  const obrazec3 = "3. obrazec"

  const skupinaTmaveSedeV1 = "tmavě šedý čtverec"
  const skupinaTmaveSedeV4 = "tmavě šedé pásmo (4 čtverce)"
  const skupinaTmaveSedeV5 = "tmavě šedé pásmo (5 čtverce)"
  const skupinaSvetleSedaV5 = "světle šedé pásmo (5 čtverců)"

  const skupinaSedaV5 = "šedé pásmo (5 čtverců)"
  const skupinaSedaV6 = "šedé pásmo (6 čtverců)"

  const skupinaBilaV4 = "bílé pásmo (4 čtverců)"
  const skupinaBilaV5 = "bílé pásmo (5 čtverců)"


  const obvod1 = contLength(obrazec1, 80)
  const ctverec1PocetStran = cont(obrazec1, 4, entityBase)
  const ctverec2PocetStran = cont(obrazec2, 4, entityBase)


  const tmaveSede = toCont(deduce(
    obvod1,
    ctverec1PocetStran,
    ctor("rate")
  ), { agent: skupinaTmaveSedeV4 });


  const tmaveSedyRate = deduce(
    last(tmaveSede),
    cont(skupinaTmaveSedeV4, 4, entitySquare),
    ctor('rate')
  )

  const sedyRate = deduceAs("4 tmavě šedé čtverce = 5 šedých čtverců")(
    to(
      tmaveSede,
      contLength(skupinaSedaV5, lastQuantity(tmaveSede))
    ),
    cont(skupinaSedaV5, 5, entitySquare),
    ctor('rate')
  )

  const bilyRate = deduce(
    toCont(deduceAs("6 šedých čtverců = 4 bílým čtvercům")(
      sedyRate,
      cont(skupinaSedaV6, 6, entitySquare)
    ), { agent: skupinaBilaV4 }),
    cont(skupinaBilaV4, 4, entitySquare),
    ctor("rate")
  )

  const bileV5 = deduce(
    bilyRate,
    cont(skupinaBilaV5, 5, entitySquare),
  )

  const horniStrana = deduce(
    bileV5,
    deduce(
      tmaveSedyRate,
      cont(skupinaTmaveSedeV1, 1, entitySquare),
    ),
    sum("horní strana u 3. obrazce")
  )

  return {
    obvodObrazec2: {
      deductionTree: deduce(
        deduce(
          bilyRate,
          cont(skupinaBilaV5, 5, entitySquare),
        ),
        ctverec2PocetStran,
        product(obrazec2)
      )
    },
    obrazecWidthToLength: {
      deductionTree: deduce(
        deduce(
          last(bileV5),
          deduceAs("horní strana u 3. obrazce = 5 světle šedých čtverců")(
            toCont(horniStrana, { agent: skupinaSvetleSedaV5 }),
            cont(skupinaSvetleSedaV5, 5, entitySquare),
            ctor('rate')
          ),
          sum("boční stran")
        ),
        last(horniStrana)
      )
    }
  }
}