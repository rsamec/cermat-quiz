import { cont, ctor } from "../../components/math"
import { deduce } from "../../utils/deduce-utils"

export default {
  1: hledaneCislo(),
}
function hledaneCislo() {
  const entity = ""
  const prvniL = "první"
  const druhyL = "druhý"
  const prvniRelative = cont(prvniL, 1 / 8, entity)
  const druhyRelative = cont(druhyL, 1 / 2, entity)

  const prvni = cont(prvniL, 1, entity)
  const druhy = cont(druhyL, 16, entity)

  return {
    deductionTree: deduce(
      deduce(
        prvniRelative,
        druhyRelative,
        ctor("comp-ratio")
      ),
      deduce(
        prvni,
        druhy,
      ),
    )
  }
}
