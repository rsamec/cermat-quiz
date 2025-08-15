
import { compRatio, cont, ctorRound, sum, productCombine, product, counter, contLength, productArea, dimensionEntity } from "../../components/math";
import { axiomInput, deduce, last, toCont } from "../../utils/deduce-utils";
import { baseCircumference, surfaceBaseArea } from "../shapes/cylinder"


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


  const obsah = surfaceBaseArea({ radius: last(dRadius) }, {
    surfaceBaseAreaLabel: areaCircleLabel,
    entity2D: dimensionEntity().area.entity,      
  });



  const dd1 = deduce(
    deduce(
      widthRectangle,
      //commonSense(`${radiusLabel} = ${reactangleHeight}`),
      toCont(dRadius, { agent: reactangleHeight }),                    
      productArea(`${rectangleLabel} obsah`)
    ),
    deduce(
      counter(circelPartLabel, 2),
      deduce(
        obsah,
        compRatio(areaCircleLabel, circelPartLabel, 4)),
      product(`dvojice ${circelPartLabel}`)
    )
  )

  const obvod = baseCircumference(
    { radius: last(dRadius) },
    { baseCircumferenceLabel: baseCircleLabel });

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