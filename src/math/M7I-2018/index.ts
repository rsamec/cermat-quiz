import { Agent } from "http";
import { compRatio, cont, ctorBooleanOption, compRelative, proportion } from "../../components/math";
import { createLazyMap, deduce, last, toCont } from "../../utils/deduce-utils";

export default createLazyMap({
  11.1: () => kone().a,
  11.2: () => kone().b,
  11.3: () => kone().c,

})


export function kone() {

  const kone = "koně";
  const zasoby = "zásoby ovsa"
  const dny = "doba, po kterou vydrží zásoby"
  const dnyEntity = "dny"

  const naseZasoby = "naše zásoby"
  const naseKone = "naše koně"
  const sousedovyZasoby = "sousedovy zásoby"
  const sousedovyKone = "sousedovy koně"

  const zasobyPomer = compRelative(sousedovyZasoby, naseZasoby, 1 / 2)
  const konePomer = compRatio(sousedovyKone, naseKone, 2)

  const nase = cont([naseZasoby,naseKone], 12, dnyEntity)

  const sousedovyZasobyNaseKone = deduce(
    deduce(
      zasobyPomer,
      proportion(false, [zasoby, dny])
    ), nase)

  const konePomerProportion = deduce(
    konePomer,
    proportion(true, [dny, kone])
  )

  return {
    a: {
      deductionTree: deduce(
        sousedovyZasobyNaseKone,
        ctorBooleanOption(24)
      )
    },
    b: {
      deductionTree: deduce(
        deduce(
          konePomerProportion,
          nase,
        ),
        ctorBooleanOption(6)
      )
    },
    c: {
      deductionTree: deduce(
        deduce(
          last(sousedovyZasobyNaseKone),
          last(konePomerProportion)
        ),
        ctorBooleanOption(9)
      )
    }
  }
}