import { compAngle, cont, contAngle, ctor, ctorBooleanOption } from "../../components/math";
import { anglesNames, deduce, last, lastQuantity, toCont } from "../../utils/deduce-utils";



export function desetiUhelnik() {
  const pocetUhlu = "úhlů"
  const vrcholovyUhelLabel = "vrcholový úhel"
  const celkem = contAngle("desitiúhelník", 360);
  const pocet = cont("desitiúhelník", 10, pocetUhlu);

  const minUhel = deduce(celkem, pocet, ctor('rate'))
  const alfa = toCont(deduce(minUhel, cont(anglesNames.alpha, 2, pocetUhlu)), { agent: anglesNames.alpha });


  const vrcholovyUhel = toCont(
    deduce(last(minUhel), cont(vrcholovyUhelLabel, 3, pocetUhlu)),
    { agent: vrcholovyUhelLabel });

  const lastVrcholovyUhel = last(vrcholovyUhel);
  const beta = deduce(
    lastVrcholovyUhel,
    compAngle(lastVrcholovyUhel.agent.join(), anglesNames.beta, "isosceles-triangle-at-the-base")
  )

  const gama = deduce(
    last(alfa),
    deduce(
      contAngle(vrcholovyUhelLabel, lastQuantity(minUhel)),
      compAngle(vrcholovyUhelLabel, anglesNames.gamma, "isosceles-triangle-at-the-base")
    )
  )

  return [
    { deductionTree: deduce(alfa, ctorBooleanOption(72)) },
    { deductionTree: deduce(beta, ctorBooleanOption(36, "smaller")) },
    { deductionTree: deduce(gama, ctorBooleanOption(0)) }
  ]
}