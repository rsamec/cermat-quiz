import { cont, ctor, compAngle, ctorOption, triangleAngle } from "../../components/math";
import { axiomInput, deduce, last } from "../../utils/deduce-utils";



export function rozdilUhlu({ input }: {
  input: {
    beta: number;
    delta: number;
  }
}) {


  const entity = ""
  const beta = axiomInput(cont("beta", input.beta, entity), 1);
  const delta = axiomInput(cont("delta", input.delta, entity), 2)

  const alfa = deduce(delta, compAngle("delta", "alfa", "supplementary"))

  const deductionTree = deduce(
    deduce(
      deduce(
        beta,
        alfa,
        triangleAngle("game")
      ),
      last(alfa),
      ctor("comp-diff")
    ),
    ctorOption("B", 11)
  )

  return { deductionTree }
}