import { cont, contAngle, contTringleAngleSum, ctor, ctorBooleanOption, ctorDifference } from "../../components/math";
import { anglesNames, connectTo, deduce, last, lastQuantity, toCont } from "../../utils/deduce-utils";



export function desetiuhelnik({ input }: {
  input: { pocetUhlu: number }
}) {


  const pocetUhlu = "úhlů"
  const rovnoramennyTrojLabel = "rovnoramenný trojúhelník";
  const vrcholovyUhelLabel = "vrcholový úhel"
  const celkem = contAngle("desitiúhelník", 360);
  const pocet = cont("desitiúhelník", input.pocetUhlu, pocetUhlu);

  const minUhel = deduce(celkem, pocet, ctor('rate'))
  const alfa = toCont(deduce(minUhel, cont(anglesNames.alpha, 2, pocetUhlu)), { agent: anglesNames.alpha });

  const triangleSum = contTringleAngleSum(rovnoramennyTrojLabel);
  const uhelRamenaRovnoramennehoTrojuhelniku = (
    { vrcholovyUhel }: { vrcholovyUhel: any },
    { uhelRamenoLabel }: { uhelRamenoLabel?: string }) => toCont(deduce(
      deduce(
        triangleSum,
        vrcholovyUhel,
        ctorDifference('obě ramena')
      ),
      cont('obě ramena', 2, pocetUhlu),
      ctor('rate')), { agent: uhelRamenoLabel ?? 'úhel ramena' }
    )

  const vrcholovyUhel = toCont(
    deduce(last(minUhel), cont(vrcholovyUhelLabel, 3, pocetUhlu)),
    { agent: vrcholovyUhelLabel });

  const beta = connectTo(uhelRamenaRovnoramennehoTrojuhelniku({
    vrcholovyUhel: last(vrcholovyUhel)
  },
    { uhelRamenoLabel: anglesNames.beta }), vrcholovyUhel)



  const gama = deduce(
    last(alfa),
    uhelRamenaRovnoramennehoTrojuhelniku({
      vrcholovyUhel: contAngle(vrcholovyUhelLabel, lastQuantity(minUhel))
    },
      { uhelRamenoLabel: anglesNames.gamma }),
  )

  return [
    { deductionTree: deduce(alfa, ctorBooleanOption(72)) },
    { deductionTree: deduce(beta, ctorBooleanOption(36, "smaller")) },
    { deductionTree: deduce(gama, ctorBooleanOption(0)) }
  ]
}