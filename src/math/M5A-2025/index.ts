import { commonSense, comp, compRatio, cont, ctorComplement, ctorDelta, ctorDifference, ctorOption, ctorRatios, nthPart, nthPartFactor, rate, ratio, ratios, sum, counter, double, product, ctor, ctorBooleanOption, contLength, evalExprAsCont, ctorTuple, dimensionEntity, squareArea, triangleArea, rectangleArea } from "../../components/math";
import { createLazyMap, deduce, deduceAs, last, mapToCont, to, toCont } from "../../utils/deduce-utils";

export default createLazyMap({
  2.1: () => ramecek(),
  2.2: () => kolecka(),
  3.1: () => jizdniKolo().a,
  3.2: () => jizdniKolo().b,
  4.1: () => kulicka().pocet,
  4.2: () => kulicka().hmotnost,
  5.1: () => patrovyDum().druhePatroChlapci,
  5.2: () => patrovyDum().prvniPatroPocetDeti,
  5.3: () => patrovyDum().pocetDivek,
  6.1: () => domecek().obvod,
  6.2: () => domecek().kratsiStranaObdelni,
  8.1: () => turistickyOdil().pocetMuzu,
  8.2: () => turistickyOdil().pocetClenu,
  8.3: () => turistickyOdil().pocetZen,
  9: () => farmar(),
  10: () => penize(),
  11: () => ctvercovaSit(),
  12: () => ctvercovaSit2(),
  13.1: () => kostky().a,
  13.2: () => kostky().b,
  13.3: () => kostky().c,
  14.1: () => poutnik().prvniKouzlo,
  14.2: () => poutnik().druheKouzlo,
  14.3: () => poutnik().maximumKouzel,
})

function ramecek() {
  return {
    deductionTree: to(
      deduce(
        deduce(
          evalExprAsCont("0+1+2+3+4+5+6+7+8", "velký čtverec", { entity: "hodnota" })
        ),
        cont("velký čtverec", 3, "řádek"),
        ctor("rate")
      ),
      commonSense("postupně dopočítáváme čísla, tam kde známe 2 čísla"),
      cont("hledaného čísla", 6, "hodnota")
    )
  }
}

function kolecka() {
  const rozdil = comp("pravý kroužek", "levý koužek", 90, "hodnota")
  const prvniKrouzek = deduce(
    compRatio("pravý kroužek", "levý koužek", 3),
    rozdil
  )
  return {
    deductionTree: deduce(
      deduce(
        compRatio("pravý kroužek", "levý koužek", 3),
        rozdil
      ),
      deduce(
        last(prvniKrouzek),
        rozdil
      ),
      ctorTuple("obě čísla")
    )
  }
}

function ctvercovaSit() {
  const dim = dimensionEntity();
  // const ctverecL = "čtverec ABC";
  // const trojuhelnikL = "trohúhelníku ABC";
  // const porovnaniStran = ratios("porovnání stran", [`${trojuhelnikL} rameno`, `${ctverecL} strana`], [2, 1])
  return {
    deductionTree: deduce(
      to(
        commonSense("pokud přiložíme 2 strany čtverce ABC za sebou, získáme délku ramena trohúhelníku ABC"),
        commonSense("celý obvod čtverce ABC je roven délce obou ramen trohúhelníku ABC"),
        comp("trohúhelníku ABC", "čtverec ABC", 4, dim.length)
      ),
      ctorOption("D", 4)
    )
  }
}
function ctvercovaSit2() {
  const trojuhlenikL = "pravoúhlý trojúhelník"
  return {
    deductionTree: deduce(
      deduce(
        deduceAs("doplníme trojúhelník ABC na čtverec, pak vidíme, že platí")(
          ratio("trojúhelník ABC", "dokreslený čtverec", 1 / 2),
          deduce(
            contLength("strana dokreslený čtverec", 4),
            squareArea("trojúhelník ABC")
          )
        ),
        deduceAs("doplníme trojúhelník KLM na obdelník, pak vzniknou 3 pravoúhlé trojúhelníky jako doplněk k původnímu trojúhelník KLM")(
          deduce(
            contLength("kratší strana", 3),
            contLength("delší strana", 4),
            rectangleArea("dokreslený obdelník")
          ),
          deduce(
            deduce(
              contLength(trojuhlenikL, 3),
              contLength(trojuhlenikL, 1),
              triangleArea(trojuhlenikL)
            ),
            deduce(
              contLength(trojuhlenikL, 3),
              contLength(trojuhlenikL, 1),
              triangleArea(trojuhlenikL)
            ),
            deduce(
              contLength(trojuhlenikL, 4),
              contLength(trojuhlenikL, 2),
              triangleArea(trojuhlenikL)
            ),
            sum("dohromady 3 pravoúhlý trojúhelník")
          ),
          ctorDifference("trojúhelník KLM")
        ),
      ),
      ctorOption("C", 3)
    )
  }
}

function kostky() {
  const entityBase = "kostka";
  const entity = "tečky";

  const agent = "těleso"
  const telesoPovrch = "těleso na povrchu"

  const teckaPerKostka = rate(agent, 12, entity, entityBase)
  return {
    a: {
      deductionTree: deduce(
        deduce(
          deduce(
            cont(agent, 2, entityBase),
            teckaPerKostka
          ),
          deduceAs("maximalizujeme počet teček na tělese tak, že stěny slepené k sobě budou mít na sobě 1 tečku")(
            evalExprAsCont("2*1", "celkem schované tečky", { entity })
          ),
          ctorDifference(telesoPovrch)
        ),
        ctorOption("C", 22)
      )
    },
    b: {
      deductionTree: deduce(
        deduce(
          deduce(
            cont(agent, 3, entityBase),
            teckaPerKostka
          ),
          deduceAs("minimalizujeme počet teček na tělese tak, že se snažíme slepit stěny se 3 tečkami k sobě, to nelze u prostřední kostky, lze pouze u jedné strany, protože na protější straně se 3 tečkami je vždy strana s 1 tečkou")(
            evalExprAsCont("3*3 + 1*1", "celkem schované tečky", { entity })
          ),
          ctorDifference(telesoPovrch)
        ),
        ctorOption("E", 26)
      )
    },
    c: {
      deductionTree: deduce(
        deduce(
          deduce(
            cont(agent, 3, entityBase),
            teckaPerKostka
          ),
          deduceAs("minimalizujeme počet teček na tělese tak, že stěny slepené k sobě budou mít na sobě 3 tečky")(
            evalExprAsCont("4*3", "celkem schované tečky", { entity })
          ),
          ctorDifference(telesoPovrch)
        ),
        ctorOption("D", 24)
      )
    },
  }
}


function turistickyOdil() {

  const muzLabel = "muži"
  const zenyLabel = "ženy"
  const clenLabel = "členové"

  const muzi = Object.fromEntries(Object.entries({
    2015: 30,
    2016: 45,
  }).map(([key, value]) => [key, counter(`${muzLabel} - ${key}`, value)]))

  const clenove = Object.fromEntries(Object.entries({
    2016: 90,
    2017: 100,
  }).map(([key, value]) => [key, counter(`${clenLabel} - ${key}`, value)]))

  const zeny = Object.fromEntries(Object.entries({
    2017: 50,
    2018: 50,
  }).map(([key, value]) => [key, counter(`${zenyLabel} - ${key}`, value)]))


  return {
    pocetMuzu: {
      deductionTree: deduce(
        deduce(
          muzi["2015"],
          muzi["2016"],
          ctor("comp-ratio")
        ),
        ctorBooleanOption(1 / 3, "closeTo", { asFraction: true })
      )
    },
    pocetClenu: {
      deductionTree: deduce(
        deduce(
          clenove["2017"],
          clenove["2016"],
          ctor("comp-ratio")
        ),
        ctorBooleanOption(1 / 9, "closeTo", { asFraction: true })
      )
    },
    pocetZen: {
      deductionTree: deduce(
        deduce(
          zeny["2017"],
          zeny["2018"],
        ),
        ctorBooleanOption(0, "greater")
      )
    }
  }
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
        sum("celkem")
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
          deduce(
            janaRatio,
            deduce(
              janaRatio,
              ivoCompare
            ),
            sum("Ivo + Jana")
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
  const dumLabel = "domeček"
  const strechaLabel = "střecha"
  const onlyStrechLabel = `${strechaLabel} bez společené části`
  const sharedLabel = "sdílená část mezi přizemí a střecha"
  const prizemiLabel = "přízemí"
  const onlyPrizemiLabel = `${prizemiLabel} bez společené části`

  const kratsiStranaLabel = "kratší strana obdelníku"
  const delsiStranLabel = "delší strana obdelníku"

  const dum = contLength(dumLabel, 24)

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
            counter(farmaPuvodneLabel, 2),
            product("2 dny")
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
  const kouzelnikPuvodne = cont("kouzelník původně", 54, entity);
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
      sum("celkem")
    ),
    ratiosKvP
  )

  const kouzelnik2 = deduce(
    deduce(
      last(kouzelnik1),
      mapToCont({ agent: "poutník" })(last(kouzelnik1)),
      sum("celkem")
    ),
    ratiosKvP
  )

  return {
    prvniKouzlo: {
      deductionTree: deduce(
        mapToCont({ agent: "kouzelník původně" })(kouzelnik),
        toCont(kouzelnik1, { agent: "kouzelník po 1.kouzle" }),
        ctorDelta("kouzelník")
      )
    },
    druheKouzlo: {
      deductionTree: deduce(
        deduce(
          deduce(
            last(kouzelnik1),
            mapToCont({ agent: "poutník" })(last(kouzelnik1)),
            sum("celkem")
          ),
          last(ratiosKvP),
          nthPart("poutník")
        ),
        double(),
        product("poutník")
      )
    },
    maximumKouzel: {
      deductionTree: deduceAs("částka musí bý dělitelná 3, tak aby šlo rozdělit v poměru 1:2, resp. aby části byla celá čísla")
        (
          deduce(
            deduce(
              last(kouzelnik2),
              mapToCont({ agent: "poutník" })(last(kouzelnik2)),
              sum("celkem")
            ),
            last(ratiosKvP),
            nthPart("poutník")
          ),
          double(),
          product("poutník")
        )
    }
  }
}