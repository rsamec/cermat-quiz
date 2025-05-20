import { cont, ctor, ctorOption, product } from "../../components/math";
import { axiomInput, deduce } from "../../utils/deduce-utils";

export function porovnatObsahObdelnikACtverec({ input }: { input: { obdelnik: { a: number, b: number }, ctverec: { a: number } } }) {
  const entity = "";
  const unit2d = "cm2";
  const unit = "cm";
  const ctverec = axiomInput(cont('čtverec a', input.ctverec.a, entity, unit), 3)

  return {
    deductionTree: deduce(
      deduce(
        deduce(
          axiomInput(cont('obdélník a', input.obdelnik.a, entity, unit), 1),
          axiomInput(cont('obdélník b', input.obdelnik.b, entity, unit), 2),
          product("obsah obdélník", ["a", "b"], unit2d, entity)
        ),
        deduce(
          ctverec,
          ctverec,
          product("obsah čtverec", ["a", "a"], unit2d, entity)
        ),
        ctor('comp-ratio')
      ),
      ctorOption("D", 12)
    )
  }
}