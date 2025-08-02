import { cont, ctor, compAngle, ctorOption, sum } from "../../components/math";
import { axiomInput, deduce, last, toCont } from "../../utils/deduce-utils";



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
  const triangleSum = cont("trojúhelník", 180, entity)
  const deductionTree = deduce(
    deduce(
      toCont(deduce(
        triangleSum,
        deduce(
          beta,
          alfa,
          sum("dvojice úhlů v trojúhelníku")
        ),
        ctor('comp-diff')
      ), { agent: 'gama' }),
      last(alfa),
      ctor("comp-diff")
    ),
    ctorOption("B", 11)
  )

  return { deductionTree }
}