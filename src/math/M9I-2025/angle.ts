import { cont, ctor, ctorBooleanOption } from "../../components/math.js";
import { axiomInput, connectTo, deduce, last, lastQuantity, toCont } from "../../utils/deduce-utils.js";



export function desetiuhelnik({ input }: {
  input: { pocetUhlu: number }
}) {


  const entity = "stupňů"
  const pocetUhlu = "úhlů"
  const rovnoramennyTrojLabel = "rovnoramenný trojúhelník";
  const vrcholovyUhelLabel = "vrcholový úhel"
  const celkem = cont("desitiúhelník", 360, entity);
  const pocet = axiomInput(cont("desitiúhelník", input.pocetUhlu, pocetUhlu), 1)

  const minUhel = deduce(celkem, pocet, ctor('rate'))
  const alfa = deduce(minUhel, cont("alfa", 2, pocetUhlu));

  const triangleSum = cont(rovnoramennyTrojLabel, 180, entity)
  const uhelRamenaRovnoramennehoTrojuhelniku = (
    { vrcholovyUhel }: { vrcholovyUhel: any },
    { uhelRamenoLabel }: { uhelRamenoLabel?: string }) => toCont(deduce(
      toCont(deduce(
        triangleSum,
        vrcholovyUhel,
        ctor('comp-diff')
      ), { agent: 'obě ramena' }),
      cont('obě ramena', 2, pocetUhlu),
      ctor('rate')), { agent: uhelRamenoLabel ?? 'úhel ramena' }
    )

  const vrcholovyUhel = toCont(
    deduce(last(minUhel), cont(vrcholovyUhelLabel, 3, pocetUhlu)),
    { agent: vrcholovyUhelLabel });

  const beta = connectTo(uhelRamenaRovnoramennehoTrojuhelniku({
    vrcholovyUhel: last(vrcholovyUhel)
  },
    { uhelRamenoLabel: 'beta' }), vrcholovyUhel)



  const gama = deduce(
    last(alfa),
    uhelRamenaRovnoramennehoTrojuhelniku({
      vrcholovyUhel: cont(vrcholovyUhelLabel, lastQuantity(minUhel), entity)
    },
      { uhelRamenoLabel: 'gama' }),
  )

  return [
    { deductionTree: deduce(alfa, ctorBooleanOption(72)) },
    { deductionTree: deduce(beta, ctorBooleanOption(36, "smaller")) },
    { deductionTree: deduce(gama, ctorBooleanOption(0)) }
  ]
}