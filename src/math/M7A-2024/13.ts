import { ctor, ctorOption, contLength, productArea } from "../../components/math";
import { axiomInput, deduce } from "../../utils/deduce-utils";

export function porovnatObsahObdelnikACtverec({ input }: { input: { obdelnik: { a: number, b: number }, ctverec: { a: number } } }) {
  const ctverec = axiomInput(contLength('čtverec a', input.ctverec.a), 3)

  return {
    deductionTree: deduce(
      deduce(
        deduce(
          axiomInput(contLength('obdélník a', input.obdelnik.a), 1),
          axiomInput(contLength('obdélník b', input.obdelnik.b), 2),
          productArea("obdélník")
        ),
        deduce(
          ctverec,
          ctverec,
          productArea("čtverec")
        ),
        ctor('comp-ratio')
      ),
      ctorOption("D", 12)
    )
  }
}