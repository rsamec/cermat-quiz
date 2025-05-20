
import { commonSense, compRatio, cont, ctorRound, product, sum} from "../../components/math";
import { axiomInput, deduce, last, lastQuantity, to } from "../../utils/deduce-utils";
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
  const entity = "cm"
  const entity2d = "cm čtverečních"

  const width = axiomInput(cont(`šedá tanga šířka`, input.tangaWidth, entity), 1)
  const widthRectangle = axiomInput(cont(`${rectangleLabel} šířka`, input.tangaWidth, entity), 1)
  const ratio = compRatio(`šedá tanga šířka`, `${circelPartLabel} ${radiusLabel}`, 2)
  const dRadius = deduce(width, ratio);


  const obsah = surfaceBaseArea({ radius: last(dRadius) }, {
    surfaceBaseAreaLabel: areaCircleLabel,
    entity2D: entity2d
  });



  const dd1 = deduce(
    deduce(
      widthRectangle,
      to(
        dRadius,
        commonSense(`${radiusLabel} = ${reactangleHeight}`),
        cont(reactangleHeight, lastQuantity(dRadius), entity)),
      product(`${rectangleLabel} obsah`, [], entity2d, entity)
    ),
    deduce(
      cont(`2 krát ${circelPartLabel}`, 2, ""),
      deduce(
        obsah,
        compRatio(areaCircleLabel, circelPartLabel, 4)),

      product(`dvojice ${circelPartLabel}`, [], entity2d, entity2d)
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
      sum(`obvod šedého obrazce`, [circelPartLabel, circelPartLabel, 'šířka'], entity, entity)
    ),
    ctorRound()
  )

  return [{ deductionTree: dd1 }, { deductionTree: dd2 }]
}