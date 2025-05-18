import { commonSense, comp, compRatio, cont, ctorComplement, ctorDelta, ctorDifference, ctorOption, ctorRatios, nthPart, nthPartFactor, product, rate, ratio, ratios, sum } from "../../components/math";
import { deduce, last, lastQuantity, to, toCont } from "../../utils/deduce-utils";

export default {
  3.1: jizdniKolo().a,
  3.2: jizdniKolo().b,
  4.1: kulicka().pocet,
  4.2: kulicka().hmotnost,
  5.1: patrovyDum().druhePatroChlapci,
  5.2: patrovyDum().prvniPatroPocetDeti,
  5.3: patrovyDum().pocetDivek,
  6.1: domecek().obvod,
  6.2: domecek().kratsiStranaObdelni,
  9: farmar(),
  10: penize(),
  14.1: poutnik().prvniKouzlo,
  14.2: poutnik().druheKouzlo,
  14.3: poutnik().maximumKouzel,
}

function jizdniKolo() {
  const entity = "otočení"
  const otaceniKola = ratios("otáčení kola", ["táta", "Mirek"], [25, 30])
  return {
    a: {
      deductionTree: deduce(
        otaceniKola,
        cont("táta", 30, entity),
        nthPart("Mirek")
      )
    },
    b: {
      deductionTree: deduce(
        otaceniKola,
        comp("táta", "Mirek", -30, entity),
      )
    }
  }
}
function kulicka() {
  const entity = 'váha'
  const unit = "g"

  const entityBase = "kulička"

  const bigLabel = "velká kulička";
  const smallLabel = "malá kulička"

  const big = rate(bigLabel, 30, { entity, unit }, entityBase);
  const small = rate(smallLabel, 20, { entity, unit }, entityBase);

  const pocetSrovnani = compRatio(smallLabel, bigLabel, 2);

  const bigPocet = deduce(
    deduce(
      deduce(
        deduce(
          big,
          small,
          ctorRatios("celkem")
        ),
        cont(smallLabel, 2, ""),
        nthPartFactor(smallLabel)
      )
      ,
      cont("celkem", 560, entity, unit),
      nthPart(bigLabel)
    ),
    big
  );

  const smallPocet = deduce(
    bigPocet,
    pocetSrovnani);

  return {
    pocet: {
      deductionTree: deduce(
        smallPocet,
        last(bigPocet),
        sum("celkem", [], entityBase, entityBase)
      )
    },
    hmotnost: {
      deductionTree: deduce(
        last(smallPocet),
        small
      )
    }
  }
}

function patrovyDum() {
  const boyLabel = "chlapci"
  const girlLabel = "dívky"
  const entity = "dítě"
  const prvniL = "první patro"
  const druheL = "druhé patro"
  const tretiL = "třetí patro"

  const rozlozeniChlapcuVPatrech = to(
    commonSense("Ve druhém patře bydlí jen dívky."),
    commonSense("V prvním a třetím patře bydlí dohromady 5 chlapců a 3 dívky."),
    commonSense("Ze všech chlapců z našeho domu pouze 3 chlapci nebydlí ve třetím patře."),
    ratios("rozložení chlapců v patrech", [prvniL, druheL, tretiL], [3, 0, 2])
  )
  const celkem = cont("celkem", 11, entity);
  const chlapci = to(
    commonSense("Ve druhém patře bydlí jen dívky."),
    commonSense("V prvním a třetím patře bydlí dohromady 5 chlapců a 3 dívky."),
    cont(boyLabel, 5, entity)
  )

  const celkovyPocetDivek = deduce(
    celkem,
    chlapci,
    ctorDifference(girlLabel)
  )
  return {
    druhePatroChlapci: {
      deductionTree: to(
        commonSense("Ve druhém patře bydlí jen dívky."),
        cont(druheL, 0, boyLabel)
      )
    },
    prvniPatroPocetDeti: {
      deductionTree: deduce(
        cont("v prvním a třetím patře", 8, entity),
        deduce(
          celkem,
          cont("v prvním a druhém patře", 8, entity),
          ctorDifference(tretiL)
        ),
        ctorDifference(prvniL)
      ),
    },
    pocetDivek: {
      deductionTree: celkovyPocetDivek

    }
  }
}

function penize() {
  const entity = 'Kč'

  const janaRatio = ratio("celkem", "Jana", 1 / 5);
  const ivoCompare = compRatio("Ivo", "Jana", 2);
  const eva = cont("Eva", 240, entity);

  return {
    deductionTree: deduce(
      deduce(
        deduce(
          to(
            janaRatio,
            deduce(
              janaRatio,
              ivoCompare
            ),
            ratio("celkem", "Ivo + Jana", 3 / 5)
          ),
          ctorComplement("Eva")
        ),
        eva
      ),
      ctorOption("B", 600)
    )
  }
}
function domecek() {
  const entity = "délka";
  const unit = "cm";
  const dumLabel = "domeček"
  const strechaLabel = "střecha"
  const onlyStrechLabel = `${strechaLabel} bez společené části`
  const sharedLabel = "sdílená část mezi přizemí a střecha"
  const prizemiLabel = "přízemí"
  const onlyPrizemiLabel = `${prizemiLabel} bez společené části`

  const kratsiStranaLabel = "kratší strana obdelníku"
  const delsiStranLabel = "delší strana obdelníku"

  const dum = cont(dumLabel, 24, entity, unit)

  const obvodJenStrecha = deduce(
    dum,
    ratios(dumLabel, [onlyPrizemiLabel, onlyStrechLabel], [1, 1])
  )
  const shared = deduce(
    obvodJenStrecha,
    ratios(strechaLabel, [onlyStrechLabel, sharedLabel], [3, 2]),
    nthPart(sharedLabel)
  )

  return {
    obvod: {
      deductionTree: deduce(
        obvodJenStrecha,
        to(
          commonSense("střecha je složena ze tří rovnostranných trojúhelníků"),
          commonSense("tyto trojúhelníky jsou spojeny tak, že dvě strany tvoří společnou základnu s přízemím"),
          ratios(strechaLabel, [onlyStrechLabel, sharedLabel], [3, 2]),
        )
      )
    },
    kratsiStranaObdelni: {
      deductionTree: deduce(
        deduce(
          deduce(
            dum,
            ratios(dumLabel, [onlyPrizemiLabel, onlyStrechLabel], [1, 1]),
            nthPart(onlyPrizemiLabel)
          ),
          last(shared),
          ctorDifference(`2x${kratsiStranaLabel}`)
        ),
        ratios(`2x${kratsiStranaLabel}`, [kratsiStranaLabel, kratsiStranaLabel], [1, 1])
      )
    }
  }
}
function farmar() {
  const entityBase = "kráva";
  const entity = "objem"
  const unit = "l"
  const farmaPuvodneLabel = "farma původně";
  const farmaNove = "farma nově"

  const farmaPuvodne = cont(farmaPuvodneLabel, 7, entityBase)
  const prodano = cont("prodáno", 5, entityBase)

  const puvodneMlekoPerKrava = rate(farmaPuvodneLabel, 15, { entity, unit }, entityBase)
  const noveMlekoPerKrava = rate(farmaNove, 20, { entity, unit }, entityBase)
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            deduce(
              farmaPuvodne,
              puvodneMlekoPerKrava
            ),
            cont(farmaPuvodneLabel, 2, "doba", "den"),
            product(farmaNove, [], { entity, unit }, { entity, unit })
          ),
          deduce(
            deduce(
              farmaPuvodne,
              prodano,
              ctorDifference(farmaPuvodneLabel)
            ),
            puvodneMlekoPerKrava
          ),
          ctorDifference(farmaNove)
        ),
        noveMlekoPerKrava
      ),
      ctorOption("A", 9)
    )
  }
}

export function poutnik() {
  const entity = "dukáty"

  const kouzelnik = cont("kouzelník", 54, entity);
  const poutnik = cont("poutník", 54, entity);
  const compareKvP = compRatio("poutník", "kouzelník", 1 / 2);

  const ratiosKvP = deduce(
    compareKvP,
    ctorRatios("celkem")
  )

  const kouzelnik1 = deduce(
    deduce(
      kouzelnik,
      poutnik,
      sum("celkem", [], entity, entity)
    ),
    ratiosKvP
  )

  const kouzelnik2 = deduce(
    deduce(
      last(kouzelnik1),
      cont("poutník", lastQuantity(kouzelnik1), entity),
      sum("celkem", [], entity, entity)
    ),
    ratiosKvP
  )

  return {
    prvniKouzlo: {
      deductionTree: deduce(
        toCont(kouzelnik, { agent: "kouzelník původně" }),
        toCont(kouzelnik1, { agent: "kouzelník po 1.kouzle " }),
        ctorDelta("kouzelník")
      )
    },
    druheKouzlo: {
      deductionTree: deduce(
        deduce(
          deduce(
            last(kouzelnik1),
            cont("poutník", lastQuantity(kouzelnik1), entity),
            sum("celkem", [], entity, entity)
          ),
          last(ratiosKvP),
          nthPart("poutník")
        ),
        cont("dvojnásobek", 2, ""),
        product("poutník", [], entity, entity)
      )
    },
    maximumKouzel: {
      deductionTree: to(
        commonSense("částka musí bý dělitelná 3, tak aby šlo rozdělit v poměru 1:2, resp. aby části byla celá čísla"),
        deduce(
          deduce(
            deduce(
              last(kouzelnik2),
              cont("poutník", lastQuantity(kouzelnik2), entity),
              sum("celkem", [], entity, entity)
            ),
            last(ratiosKvP),
            nthPart("poutník")
          ),
          cont("dvojnásobek", 2, ""),
          product("poutník", [], entity, entity)
        ),

      )
    }
  }
}