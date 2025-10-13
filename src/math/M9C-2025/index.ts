import { compRatio, compRelative, cont, ctor, ctorDifference, ctorRatios, ctorUnit, rate, ratio, ctorPercent, percent, ctorOption, sum, product, counter, contLength, dimensionEntity, contArea, ctorExpressionOption, compRelativePercent, comp, ctorComplement, evalExprAsCont, ctorRound, productCombine, pythagoras, ctorBooleanOption } from "../../components/math";
import { createLazyMap, deduce, deduceAs, last, toCont } from "../../utils/deduce-utils";

export default createLazyMap({
  1: () => porovnani(),
  6.1: () => nabytek().cenaSkrine,
  6.2: () => nabytek().cenaPostele,
  6.3: () => nabytek().nocniStolek,
  7.1: () => cyklista().klesaniPrumer,
  7.2: () => cyklista().trasa,
  7.3: () => cyklista().dobaStoupani,
  8.1: () => dlazdice().obsah,
  8.2: () => dlazdice().pokoj,
  11.1: () => rodinnyDum().a,
  11.2: () => rodinnyDum().b,
  11.3: () => rodinnyDum().c,
  12: () => hriste(),
  13: () => krychle(),
  15.1: () => kbelik(),
  15.2: () => hrnciri(),
  15.3: () => rybiz(),
})

function porovnani() {
  const entity = "hmotnost";
  const zadane1 = cont("zadané množství", 5, entity, "kg");
  const zadane2 = cont("zadané množství", 0.25, entity, "g");

  return {
    deductionTree: deduce(
      deduce(
        zadane1,
        ctorUnit("g")
      ),
      zadane2,
      ctor('comp-ratio')
    )
  }
}

function kbelik() {
  const kbelikLabel = "kbelík";
  const entity = "borůvky";
  const unit = "hrnek"
  const celkem = cont(kbelikLabel, 50, entity, unit)
  return {
    deductionTree: deduce(
      deduce(
        celkem,
        deduce(
          cont(kbelikLabel, 50, entity, unit),
          percent(kbelikLabel, "odsypáno", 46)
        ),
        ctorDifference("zbývá")
      ),
      ctorExpressionOption("F", "x>25")
    )
  }
}

function nabytek() {
  const postelLabel = "postel";
  const nocniStolekLabel = "noční stolek";
  const skrinLabel = "skříň";
  const entity = "cena";

  const nocniStolek = cont(nocniStolekLabel, "n", entity);
  const skrinVsNocniStolek = deduce(
    compRelative(nocniStolekLabel, skrinLabel, -1 / 2),
    ctor("invert-comp-ratio")
  );
  const postelVsNocniStolek = deduce(
    compRelative(nocniStolekLabel, postelLabel, 1 / 3),
    ctor("invert-comp-ratio")
  );
  return {
    cenaSkrine: {
      deductionTree:
        deduce(
          nocniStolek,
          skrinVsNocniStolek
        )

    },
    cenaPostele: {
      deductionTree: deduce(
        nocniStolek,
        postelVsNocniStolek,
      )
    },
    nocniStolek: {
      deductionTree: deduce(
        deduce(
          last(skrinVsNocniStolek),
          last(postelVsNocniStolek),
          ctorRatios("celkem")
        ),
        cont("celkem", 9000, entity),
      )
    }
  }
}

function cyklista() {
  const dim = dimensionEntity("km");
  const celaTrasaLabel = "celá trasa";
  const rovinaLabel = "rovina";
  const stoupaniLabel = "stoupání";
  const klesaniLabel = "klesání";
  const entity = "rychlost"
  const unit = "km/h"

  const stoupani = cont(stoupaniLabel, 14, ...dim.lengths);
  const klesaniRychlost = deduce(
    cont(rovinaLabel, 30, entity, unit),
    compRelativePercent(klesaniLabel, rovinaLabel, 40),
  )

  return {
    klesaniPrumer: {
      deductionTree: klesaniRychlost
    },
    trasa: {
      deductionTree: deduce(
        deduce(
          deduce(
            ratio(celaTrasaLabel, rovinaLabel, 1 / 3),
            deduce(
              compRatio(klesaniLabel, celaTrasaLabel, -5),
              ctor("ratio")
            ),
            sum("rovina a klesání")
          ),
          ctorComplement(stoupaniLabel)
        ),
        stoupani
      )
    },
    dobaStoupani: {
      deductionTree: deduce(
        deduce(
          stoupani,
          deduce(
            compRelative(stoupaniLabel, klesaniLabel, -1 / 2),
            last(klesaniRychlost)
          ),
          evalExprAsCont("draha / rychlost", { kind: 'cont', agent: `doba ${klesaniLabel}`, entity: 'čas', unit: 'h', asRatio: true })
        ),
        ctorUnit("min")
      )
    }
  }
}

function dlazdice() {
  const dim = dimensionEntity();
  const polomer = contLength("poloměr", 5);
  const entity = "kruh"

  const vzorLabel = "dlaždice (čtvercový vzor)";
  const ctverec = contLength(vzorLabel, 40)
  const malyKruh = rate("pokoj", 4, "kruh", vzorLabel);
  const velkyKruh = rate("pokoj", 1, "kruh", vzorLabel);

  const pocetDlazdic = deduce(
    deduce(
      deduce(
        contLength("šířka pokoje", 2, "m"),
        ctorUnit("cm")
      ),
      ctverec,
      ctor("quota")
    ),
    deduce(
      deduce(
        contLength("délka pokoje", 3.2, "m"),
        ctorUnit("cm")
      ),
      ctverec,
      ctor("quota")
    ),
    productCombine("pokoj", { entity: vzorLabel })
  );

  return {
    obsah: {
      deductionTree: deduce(
        deduce(
          polomer,
          evalExprAsCont("π * r^2", { kind: 'cont', agent: 'obsah kruhu', ...dim.area })
        ),
        ctorRound()
      )
    },
    pokoj: {
      deductionTree: deduce(
        toCont(deduce(
          pocetDlazdic,
          malyKruh
        ), { agent: "malý kruh" }),
        toCont(deduce(
          last(pocetDlazdic),
          velkyKruh
        ), { agent: "velký kruh" }),
        ctorDifference("rozdíl")
      )
    }
  }
}

function rodinnyDum() {
  const entity = "návštěvník"

  const dospelyCelkem = cont("dospělý", 80 + 60 + 70 + 90 + 100, "návštěvník");
  const detiCelkem = cont("děti", 30 + 10 + 30 + 50 + 40, "návštěvník");
  return {
    a: {
      deductionTree: deduce(
        deduceAs("první 3 měsíce")(
          cont("dospělý", 80 + 60 + 70, "návštěvník"),
          cont("děti", 30 + 10 + 30, "návštěvník"),
          ctor("comp-ratio")
        ),
        ctorBooleanOption(3)
      )
    },
    b: {
      deductionTree: deduce(
        deduceAs("celá sezóna")(
          dospelyCelkem,
          cont("dospělý", 5, "měsíc"),
          ctor("rate")
        ),
        ctorBooleanOption(80)
      )
    },
    c: {
      deductionTree: deduce(
        deduceAs("celá sezóna")(
          detiCelkem,
          deduce(
            dospelyCelkem,
            detiCelkem,
            sum("celkem")
          ),
          ctorPercent()
        ),
        ctorBooleanOption(40, "closeTo", { asPercent: true })
      )
    }
  }
}

function hriste() {

  const entity = "kroky"
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            cont("3.úsek", 50, entity),
            cont("1.úsek", 30, entity),
            sum("delší odvěsna")
          ),
          cont("přepona", 100, entity),
          pythagoras("přepona", ["kratší odvěsna", "delší odvěsna"])
        ),
        cont("2.úsek", 35, entity),
        sum("poslední úsek")
      ),
      ctorOption("D", 95)
    )
  }
}
function krychle() {
  const dim = dimensionEntity();
  const agent = "krychle";
  const entity = "bílý čtvereček"
  const agentStena = "stěna";
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          toCont(
            deduce(
              toCont(
                deduce(
                  contArea(agent, 480),
                  counter(agent, 6),
                  ctor("rate")
                ), { agent: agentStena }
              ),
              cont(agentStena, 20, entity),
              ctor("rate")
            ), { agent: entity }),
          evalExprAsCont("sqrt(plocha)", { agent: "čtvereček", kind: 'cont', ...dim.length })
        ),
        counter("čtvereček", 5),
        product("strana krychle")
      ),
      ctorOption("B", 10)
    )
  }
}
function hrnciri() {
  const P = "Petr"
  const R = "Radim"
  const S = "Slávek"
  const T = "Tomáš"

  const entity = "hrnek";

  const celkem = cont("celkem", 240, entity);

  const PvsR = compRelative(P, R, -1 / 2);
  const SvsR = compRelativePercent(S, R, -25);
  const TvsR = compRelativePercent(T, R, -25);


  const radim = deduce(
    deduce(
      PvsR,
      SvsR,
      TvsR,
      ctorRatios("celkem")
    ),
    celkem,
  )

  return {
    deductionTree: deduce(
      deduce(
        deduce(radim, TvsR),
        deduce(last(radim), PvsR)
      ),
      ctorOption("B", 20)
    )
  }
}

function rybiz() {
  const entity = "hrnek";
  const babickaVsJitka = compRelative("babička", "Jitka", 1 / 2);
  const maminkaVsBabicka = deduce(
    compRatio("maminka", "Jitka", 2),
    babickaVsJitka,
  )
  const babicka = deduce(
    maminkaVsBabicka,
    comp("babička", "maminka", -2, entity)
  )
  return {
    deductionTree: deduce(
      deduce(
        babicka,
        deduce(last(babicka), maminkaVsBabicka),
        deduce(last(babicka), babickaVsJitka),
        sum("dohromady")
      ),
      ctorOption("A", 18)
    )
  }
}
