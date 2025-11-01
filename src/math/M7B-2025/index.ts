import { commonSense, compRelative, cont, ctor, sum, ctorComparePercent, ctorComplement, ctorDelta, ctorDifference, ctorOption, ctorPercent, ctorRatios, counter, nthPart, percent, proportion, rate, ratio, product, double, ctorScale, contLength, contArea, dimensionEntity, ratios, ctorRatiosInvert, comp, evalFormulaAsCont, formulaRegistry, rectangleArea, baseAreaVolume, triangleArea, triangleAngle, compAngle, ctorBooleanOption, evalExprAsCont } from "../../components/math"
import { createLazyMap, deduce, deduceAs, last, lastQuantity, to, toCont, type TreeNode } from "../../utils/deduce-utils"

export default createLazyMap({
  1: () => hledaneCislo(),
  2: () => pomer(),
  4.1: () => vodniNadrz().pomer,
  4.2: () => vodniNadrz().pocetCerpadel,
  4.3: () => vodniNadrz().pocetHodin,
  5.1: () => zaciSkupiny().dvojic,
  5.2: () => zaciSkupiny().zaku,
  6.1: () => operaceM().a,
  6.2: () => operaceM().b,
  6.3: () => operaceM().c,
  7.1: () => hranol().vyskaHranol,
  7.2: () => hranol().obvodPodstava,
  7.3: () => hranol().obsahPodstava,
  7.4: () => hranol().objem,
  10.1: () => deleniObrazce().a,
  10.2: () => deleniObrazce().b,
  10.3: () => deleniObrazce().c,
  11: () => uhly(),
  12: () => ctvercovaSit(),
  13: () => kapesne().utratila,
  14: () => kapesne().usetrila,
  15.1: () => cislo(),
  15.2: () => zahradnictvi(),
  15.3: () => predstaveni(),
})


function hledaneCislo() {
  const entity = ""
  const prvniL = "osmina"
  const druhyL = "polovina"
  const prvniRelative = cont(prvniL, 1 / 8, entity)
  const druhyRelative = cont(druhyL, 1 / 2, entity)

  const prvni = cont(prvniL, 1, entity)
  const druhy = cont(druhyL, 16, entity)

  return {
    deductionTree: deduce(
      deduceAs("Osmina čísla + 16 = Polovina čísla + 1")
        (deduce(
          prvniRelative,
          druhyRelative,
          ctor("comp-ratio")
        ),
          deduce(
            prvni,
            druhy,
          )
        ),
      double(),
      ctorScale("hledané číslo")
    )
  }
}

function pomer() {
  const entity = ""
  const a3 = cont("3. číslo", 72, entity)
  const a4 = cont("4. číslo", 108, entity)

  const sousedniCislaPomerLabel = "sousední čísla";

  const sousedniCislaPomer =
    deduce(
      a3, a4,
      ctorRatios(sousedniCislaPomerLabel, { useBase: true }),
    )


  const createRatios = (treeNode: TreeNode, n1: number, n2: number) => {
    const newRatio = last(treeNode)
    return {
      ...newRatio,
      parts: [`${n1}. číslo`, `${n2}. číslo`],
    }
  }

  return {
    deductionTree: deduce(
      deduce(
        deduce(
          to(
            sousedniCislaPomer,
            createRatios(sousedniCislaPomer, 2, 3)
          ),
          a3,
          nthPart("2. číslo")
        ),
        createRatios(sousedniCislaPomer, 1, 2),
        nthPart("1. číslo")
      ),
      deduce(
        deduce(
          createRatios(sousedniCislaPomer, 4, 5),
          a4,
          nthPart("5. číslo")
        ),
        createRatios(sousedniCislaPomer, 5, 6),
        nthPart("6. číslo")
      ),
      ctor("tuple")
    ),
  }
}

function vodniNadrz() {
  const entity = "doba"
  const unit = "h"
  const entityCerpadlo = "čerpadlo"
  return {
    pomer: {
      deductionTree: deduce(
        deduce(
          cont("doplněno", 4, entity, unit),
          cont("plně naplněno", 6, entity, unit),
          ctor('ratio')
        ),
        ctorComplement("ráno již naplněno")
      )
    },
    pocetCerpadel: {
      deductionTree: deduce(
        deduce(
          deduce(
            cont("původně", 6, entity, unit),
            cont("nově", 8, entity, unit),
            ctor("comp-ratio")
          ),
          proportion(true, [entity, entityCerpadlo])
        ),
        cont("původně", 4, entityCerpadlo)
      )
    },
    pocetHodin: {
      deductionTree:
        deduce(
          deduce(
            deduce(
              deduce(
                cont("původně", 4, entityCerpadlo),
                cont("nově", 2, entityCerpadlo),
                ctor("comp-ratio")
              ),
              proportion(true, [entityCerpadlo, entity])
            ),
            cont("původně", 6, entity, unit)
          ),
          ratio("nově", "nově polovina nádrže", 1 / 2)
        )
    }
  }
}

function zaciSkupiny() {
  const entityGroup = "skupina";
  const entity = "žáků"

  const dvojice = "dvojic"
  const trojice = "trojic"


  const skupinaRatios = deduce(
    ratios("rozložení žáků", [dvojice, trojice], [2, 3]),
    ctorRatiosInvert("rozložení skupin")
  )

  const dvojicePriRovnosti = deduceAs("rozložení žáků,resp. vytvořených skupin při rovnosti")(
    skupinaRatios,
    comp(dvojice, trojice, 2, entityGroup),
    nthPart(dvojice)
  )



  const dvojiceCelkem = deduce(
    dvojicePriRovnosti,
    cont("zbývající dvojice", 1, entityGroup),
    sum(dvojice)
  )




  return {
    dvojic: {
      deductionTree: dvojiceCelkem,

    },
    zaku: {
      deductionTree: deduce(
        deduce(
          last(dvojiceCelkem),
          rate(dvojice, 2, entity, entityGroup)
        ),
        deduce(
          deduce(
            last(skupinaRatios),
            last(dvojicePriRovnosti),
            nthPart(trojice)
          ),
          rate(trojice, 3, entity, entityGroup)
        ),
        sum("celkem")
      )
    }

  }
}

function kapesne() {
  const entity = "korun"
  const entityBase = "měsíc"
  const agentHelena = "Helena";
  const agentTereza = "Tereza";

  const ledenPocatekHelena = cont("počátek leden", 550, entity);
  const brezenPocatekHelena = cont("počátek březen", 1000, entity);

  const kapesneRateHelena = rate(agentHelena, 400, entity, entityBase)
  const kapesneRateTereza = rate(agentTereza, 400, entity, entityBase)

  const ledenPocateTereza = cont("počátek leden", 400, entity);
  const dubenPocateTereza = cont("počátek duben", 1200, entity);

  return {
    utratila: {
      deductionTree: deduce(
        deduce(
          deduce(
            kapesneRateHelena,
            cont("přijmy z kapesného", 2, entityBase)
          ),
          toCont(
            deduce(
              ledenPocatekHelena,
              brezenPocatekHelena,
              ctorDelta(agentHelena),
            ), { agent: "změna stavu účtu" }),
          ctorDifference("utraceno")
        ),
        ctorOption("A", 350)
      )
    },
    usetrila: {
      deductionTree: deduce(
        deduce(
          toCont(
            deduce(
              ledenPocateTereza,
              dubenPocateTereza,
              ctorDelta(agentTereza),
            ), { agent: "ušetřila" }),
          deduce(
            kapesneRateTereza,
            cont("přijmy z kapesného", 3, entityBase)
          ),
          ctor('ratio')
        ),
        ctorOption("B", 2 / 3, { asFraction: true })
      )
    }
  }
}

function hranol() {
  const dim = dimensionEntity()
  const bocniStenaObdelnikL = "boční stěna - obdelník"
  const bocniStenaCtverecL = "boční stěna - čtverec"

  const podstavaVyska = contLength("výška podstavy", 4)

  const bocniStenaObdelnik = contLength(bocniStenaObdelnikL, 11)
  const vyskaHranol = deduce(
    contArea(bocniStenaObdelnikL, 55),
    bocniStenaObdelnik,
    evalFormulaAsCont(formulaRegistry.surfaceArea.rectangle, x => x.b, "výška hranolu", dim.length)
  )

  const bocniStenaCtverec = to(
    commonSense("boční stěna čtverec => výška hranolu = strana čtverce"),
    last(vyskaHranol),
    contLength(bocniStenaCtverecL, lastQuantity(vyskaHranol))
  )
  const obsah = deduce(
    deduce(
      last(bocniStenaCtverec),
      podstavaVyska,
      rectangleArea("obdelník")
    ),
    deduce(
      deduceAs("podstava hranol - rozdělení na obdelník 4x5 a levý a pravý pravoúhlý trojůhelník, které přiléhají k obdelníku")(
        bocniStenaObdelnik,
        last(bocniStenaCtverec),
        ctorDifference("zbytek základny")
      ),
      podstavaVyska,
      triangleArea("levý a pravý pravoúhlý trojůhelník")
    ),
    sum("obsah postavy hranolu")
  )

  return {
    vyskaHranol: {
      deductionTree: vyskaHranol,
    },
    obvodPodstava: {
      deductionTree: deduce(
        deduce(
          bocniStenaCtverec,
          counter(bocniStenaCtverecL, 3),
          product(bocniStenaCtverecL)
        ),
        bocniStenaObdelnik,
        sum("obvod podstavy hranolu")
      )
    },
    obsahPodstava: {
      deductionTree: obsah
    },
    objem: {
      deductionTree: deduce(
        last(obsah),
        last(vyskaHranol),
        baseAreaVolume("objem hranolu")
      )
    }
  }
}

function cislo() {
  const entity = ""

  return {
    deductionTree: deduce(
      deduce(
        cont("zvětšené číslo", 98, entity),
        cont("zadané číslo", 56, entity),
        ctorComparePercent()
      ),
      ctorOption("F", 75, { asPercent: true })
    )
  }
}

function zahradnictvi() {
  const entity = "sazenic"
  const celkemLabel = "květina";
  const kopretinyLabel = "kopretina";
  const hvozdikyLabel = "hvozdík";
  const astraLabel = "astra";



  const celkem = cont(celkemLabel, 120, entity)
  const hvozdiky = deduce(
    rate(hvozdikyLabel, 24, entity, "bedna"),
    cont(hvozdikyLabel, 2, "bedna")
  )

  return {
    deductionTree: deduce(
      deduce(
        deduce(
          celkem,
          deduce(
            deduce(
              celkem,
              ratio(celkemLabel, kopretinyLabel, 1 / 4)
            ),
            hvozdiky,
            sum("dohromady")
          ),
          ctorDifference(astraLabel)
        ),
        celkem,
        ctorPercent()
      ),
      ctorOption("B", 35, { asPercent: true })
    )
  }
}

function predstaveni() {
  const entity = "diváků";
  const dospeliLabel = "dospělý"
  const detiLabel = "děti"
  const predskolniDetiLabel = "předškoláci"

  const dospely = cont(dospeliLabel, 100, entity)

  const deti = deduce(
    dospely,
    compRelative(detiLabel, dospeliLabel, 1 / 2)
  )
  const predskolaci = deduce(
    deti,
    percent(detiLabel, predskolniDetiLabel, 60)
  )
  return {
    deductionTree: deduce(
      deduce(
        predskolaci,
        deduce(
          last(deti),
          dospely,
          sum("celkem")
        ),
        ctorPercent()
      ),
      ctorOption("C", 36, { asPercent: true })
    )
  }
}

export function operaceM() {
  const entity = ""
  
  return {
    a: {
      deductionTree: deduce(
        evalExprAsCont(`1-8+0-5+9`, "M(18 059)", { entity })
      )
    },
    b: {
      deductionTree: to(
        commonSense("největší možné s různými číslicemi"),
        deduce(
          evalExprAsCont(`9-8+7-6+5`, "M(98 765)", { entity })
        ),
        commonSense("snížení jednotek nestačí, snižujeme o 1 desítku"),
        deduce(
          evalExprAsCont(`9-8+7-5+6`, "M(98 756)", { entity })
        ),
        commonSense("snížení jednotek ani desítek nestačí, snižujeme o 1 stovku"),
        deduce(
          evalExprAsCont(`9-8+6-7+5`, "M(98 675)", { entity })
        ),
        commonSense("dále jen snížení jednotek o 4"),
        deduce(
          evalExprAsCont(`9-8+6-7+1`, "M(98 671)", { entity })
        ),
        cont("M(98 671)", 98671, entity)
      )
    },
    c: {
      deductionTree:  to(
        commonSense("nejmenší možné číslo s různými číslicemi"),
        deduce(
          evalExprAsCont(`1-0+2-3`, "M(1 023)", { entity })
        ),       
        commonSense("dále jen zvýšení jednotek o 1"),
        deduce(
           evalExprAsCont(`1-0+2-4`, "M(1 024)", { entity })
        ),
        cont("M(1 024)", 1024, entity)
      )
    }
  }
}

export function deleniObrazce() {

  const dim = dimensionEntity()
  const bigL = "velký rovnostranný trojúhelník";
  const smallL = "strana malý rovnostranný trojúhelník";

  const strana = deduce(
    contLength(bigL, 60),
    cont(bigL, 3, "strana"),
    ctor('rate')
  )

  const zakladna = deduce(
    toCont(strana, { agent: `strana ${bigL}` }),
    to(
      commonSense("základna malého rovnostranného trojúhelníku se rovná 3 zkrácením, resp. o kolik byly jednotlivé strany zkráceny"),
      compRelative(`strana ${bigL}`, smallL, 1 / 3)
    )
  );

  return {
    a: {
      deductionTree: deduce(
        deduce(
          zakladna,
          last(zakladna),
          last(zakladna),
          evalFormulaAsCont(formulaRegistry.circumReference.triangle, x => x.o, smallL, dim.length)
        ),
        ctorBooleanOption(30)
      )
    },
    b: {
      deductionTree: deduce(
        deduce(
          toCont(last(strana), { agent: `rameno ${bigL}` }),
          last(zakladna),
          ctor('comp-ratio')
        ),
        ctorBooleanOption(2)
      )
    },
    c: {
      deductionTree: deduce(
        toCont(last(zakladna), { agent: `kratší základna lichoběžníku` }),
        toCont(last(strana), { agent: `delší základna lichoběžníku` }),
        ctorRatios("poměr", { useBase: true })
      ),
      convertToTestedValue: value => value.ratios.join(":")
    }
  }
}


function uhly() {
  const pravouhlyLabel = "pravouhlý trojúhelník ABC";
  const rovnoramennyLabel = "rovnoramenný trojúhelník KCS";
  const vrchol = deduce(
    cont("pravý úhel u vrcholu A", 90, "stupeň"),
    cont("úhel u vrcholu B", 56, "stupeň"),
    triangleAngle("úhel u vrcholu C")
  );
  return {
    deductionTree: deduce(
      deduce(
        deduceAs(`2 trojúhlníky - ${pravouhlyLabel} a ${rovnoramennyLabel}`)(
          vrchol,
          to(
            last(vrchol),
            cont("úhel u vrcholu K", lastQuantity(vrchol), "stupeň")
          ),
          triangleAngle("úhel u vrcholu S")
        ),
        compAngle("úhel 𝜔", "úhel u vrcholu S", "supplementary")
      ),
      ctorOption("D", 68)
    )
  }
}

function ctvercovaSit() {
  const celekL = "čtvercové pole"
  const polovinaL = "polovina čtvercového pole";
  const ctvrtinaL = "čtvrtina čtvercového pole";

  const osmiL = "osmiúhelník navíc"
  const celek = contArea(celekL, 25);
  return {
    deductionTree: deduce(
      deduce(
        deduce(
          deduce(
            celek,
            ratio(celekL, polovinaL, 1 / 2),
          ),
          counter(polovinaL, 4),
          ctorScale(osmiL)
        ),
        deduce(


          deduce(
            celek,
            ratio(celekL, ctvrtinaL, 1 / 4),
          ),
          counter(ctvrtinaL, 4),
          ctorScale(osmiL)
        ),
        sum(`celkem ${osmiL}`)
      ),
      ctorOption("C", 75)
    )
  }
}