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

  const nase = "naše"
  const sousedovy = "sousedovy"

  const zasobyPomer = compRelative(sousedovy, nase, 1 / 2)
  const konePomer = compRatio(sousedovy, nase, 2)

  const naseZasoby = cont(nase, 12, dnyEntity)

  const sousedovyZasobyNaseKone = deduce(
    deduce(
      zasobyPomer,
      proportion(false, [zasoby, dny])
    ), naseZasoby)

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
          naseZasoby,
        ),
        ctorBooleanOption(6)
      )
    },
    c: {
      deductionTree: deduce(
        deduce(
          toCont(last(sousedovyZasobyNaseKone), { agent: nase }),
          last(konePomerProportion)
        ),
        ctorBooleanOption(9)
      )
    }
  }
}