import { cont, ctor, compAngle, sum } from "../../components/math.js";
import { axiomInput, deduce, last, toCont } from "../../utils/deduce-utils.js";



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
    toCont(deduce(
      triangleSum,
      deduce(
        beta,
        alfa,
        sum("dvojice úhlů v trojúhelníku", ["alfa", "beta"], entity, entity)
      ),
      ctor('comp-diff')
    ), { agent: 'gama' }),
    last(alfa),
    ctor("comp-diff")
  )

  return { deductionTree }
}