import { commonSense, compRelative, cont, ctor, sum, ctorComparePercent, ctorComplement, ctorDelta, ctorDifference, ctorOption, ctorPercent, ctorRatios, counter, gcd, nthPart, percent, proportion, rate, ratio, product, double, ctorScale } from "../../components/math"
import { createLazyMap, deduce, deduceAs, last, to, toCont, type TreeNode } from "../../utils/deduce-utils"

export default createLazyMap({
  1: () => hledaneCislo(),
  2: () => pomer(),
  4.1: () => vodniNadrz().pomer,
  4.2: () => vodniNadrz().pocetCerpadel,
  4.3: () => vodniNadrz().pocetHodin,
  5.1: () => zaciSkupiny().dvojic,
  5.2: () => zaciSkupiny().zaku,
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

  const sousedniCislaPomer = deduce(
    deduce(
      a3, a4,
      ctorRatios(sousedniCislaPomerLabel)
    ),
    deduce(a3, a4, gcd("největší společný násobek", entity)),
    ctor('scale-invert')
  );

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
  const entityDvojic = "dvojic"
  const entityTrojic = "trojic"
  const entity = "žáků"


  const pomer = deduce(
    deduce(
      cont("dvojice", 3, entityGroup),
      cont("trojice", 2, entityGroup),
      ctorRatios("rozložení při rovnosti")
    ),
    deduce(
      deduce(
        cont("dvojice", 3, entityGroup),
        cont("trojice", 2, entityGroup),
        ctorDifference("jednotkový rozdíl při rovnosti")
      ),
      counter("rozdíl při rovnosti", 2),
      product("rozdíl při rovnosti")
    ),
    ctor("scale")
  )

  const dvojic = deduce(
    to(
      pomer,
      cont("skupina dvojic", 6, entityDvojic)
    ),
    cont("zbývající žáci", 1, entityDvojic),
    sum("skupina dvojic")
  )




  return {
    dvojic: {
      deductionTree: dvojic,

    },
    zaku: {
      deductionTree: deduce(
        deduce(
          last(dvojic),
          rate("skupina", 2, entity, entityDvojic)
        ),
        deduce(
          to(
            last(pomer),
            cont("skupina trojic", 4, entityTrojic)
          ),
          rate("skupina", 3, entity, entityTrojic)
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
        ctorOption("B", 2 / 3, {asFraction: true})
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