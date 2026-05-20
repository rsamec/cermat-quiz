import { compAngle, cont, contAngle, ctor, ctorBooleanOption } from "../../components/math";
import { anglesNames, deduce, last } from "../../utils/deduce-utils";



export function desetiUhelnik() {
  const pocetUhlu = "úhel"
  const vrcholovyUhelLabel = "vrcholový úhel"
  const desetiuhelnikAgent = "desitiúhelník"
  const celkem = contAngle(desetiuhelnikAgent, 360);
  const pocet = cont(desetiuhelnikAgent, 10, pocetUhlu);

  const minUhel = deduce(celkem, pocet, ctor('rate'))
  const alfa = deduce(minUhel, cont([desetiuhelnikAgent, anglesNames.alpha], 2, pocetUhlu));


  const vrcholovyUhel = deduce(last(minUhel), cont([desetiuhelnikAgent, vrcholovyUhelLabel], 3, pocetUhlu))

  const beta = deduce(
    vrcholovyUhel,
    compAngle(last(vrcholovyUhel).agent.join(), anglesNames.beta, "isosceles-triangle-at-the-base")
  )

  const gama = deduce(
    last(alfa),
    deduce(
      last(minUhel),
      compAngle(desetiuhelnikAgent, anglesNames.gamma, "isosceles-triangle-at-the-base")
    )
  )

  return [
    { deductionTree: deduce(alfa, ctorBooleanOption(72)) },
    { deductionTree: deduce(beta, ctorBooleanOption(36, "smaller")) },
    { deductionTree: deduce(gama, ctorBooleanOption(0)) }
  ]
}