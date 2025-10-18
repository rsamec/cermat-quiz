
import { compRatio, ctorRound, sum, product, counter, contLength, rectangleArea, circleArea, circleLength } from "../../components/math";
import { axiomInput, deduce, last, toCont } from "../../utils/deduce-utils";


interface Params {
  tangaWidth: number;
}

export default function build({ input }: {
  input: Params,
}) {

  const radiusLabel = "poloměr";
  const areaCircleLabel = "obsah kruhu";
  const baseCircleLabel = "obvod kruhu";
  const circelPartLabel = "bílá čtvrtkružnice";
  const rectangleLabel = "celý obdelník";
  const reactangleHeight = `${rectangleLabel} výška`;
  const width = axiomInput(contLength(`šedá tanga šířka`, input.tangaWidth), 1)
  const widthRectangle = axiomInput(contLength(`${rectangleLabel} šířka`, input.tangaWidth), 1)
  const ratio = compRatio(`šedá tanga šířka`, `${circelPartLabel} ${radiusLabel}`, 2)
  const dRadius = deduce(width, ratio);


  const obsah = deduce(last(dRadius), circleArea(areaCircleLabel));

  const dd1 = deduce(
    deduce(
      widthRectangle,
      //commonSense(`${radiusLabel} = ${reactangleHeight}`),
      toCont(dRadius, { agent: reactangleHeight }),
      rectangleArea(`${rectangleLabel} obsah`)
    ),
    deduce(
      counter(circelPartLabel, 2),
      deduce(
        obsah,
        compRatio(areaCircleLabel, circelPartLabel, 4)),
      product(`dvojice ${circelPartLabel}`)
    )
  )

  const obvod = deduce(last(dRadius), circleLength(baseCircleLabel));

  const obvodCvrtkruh = deduce(obvod, compRatio(baseCircleLabel, circelPartLabel, 4));
  const dd2 = deduce(
    deduce(
      obvodCvrtkruh,
      last(obvodCvrtkruh),
      width,
      sum(`obvod šedého obrazce`)
    ),
    ctorRound()
  )

  return [{ deductionTree: dd1 }, { deductionTree: dd2 }]
}