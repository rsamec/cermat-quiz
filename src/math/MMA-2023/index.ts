import { compRatio, ctor } from "../../components/math";
import { createLazyMap, deduce } from "../../utils/deduce-utils";


export default createLazyMap({
  1: () => trzby(),
})


function trzby() {
  return {
    deductionTree: deduce(
      deduce(
        compRatio("únor", "leden", 4 / 5),
        ctor('invert-comp-ratio')
      ),
      ctor("convert-percent"),
    )
  }
}
