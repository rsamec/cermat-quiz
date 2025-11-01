import { ctor, compAngle, ctorOption, triangleAngle, contAngle } from "../../components/math";
import { anglesNames, deduce, last } from "../../utils/deduce-utils";



export function rozdilUhlu({ input }: {
  input: {
    beta: number;
    delta: number;
  }
}) {

  const beta = contAngle(anglesNames.beta, input.beta);
  const delta = contAngle(anglesNames.delta, input.delta)

  const alfa = deduce(delta, compAngle(anglesNames.delta, anglesNames.alpha, "supplementary"))

  const deductionTree = deduce(
    deduce(
      deduce(
        beta,
        alfa,
        triangleAngle(anglesNames.gamma)
      ),
      last(alfa),
      ctor("comp-diff")
    ),
    ctorOption("B", 11)
  )

  return { deductionTree }
}