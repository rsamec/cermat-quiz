
import { commonSense, compRatio, cont, product, type Container } from "../../components/math.js";
import { axiomInput, deduce, last, to } from "../../utils/deduce-utils.js";
import { surfaceBaseArea, surfaceBaseAreaIn, surfaceIn } from "../shapes/cylinder.js"


interface Params {
  tangaWidth: number;
}

export default function build({ input }: {
  input: Params,
}) {

  const radiusLabel = "poloměr";
  const circleLabel = "obsah kruhu";
  const circelPartLabel = "čtvrtkruh";
  const tangaHeight = "tanga výška";
  const entity = "cm"
  const entity2d = "cm čtverečních"



  const width = axiomInput(cont(`tanga šířka`, input.tangaWidth, entity), 1)
  const ratio = compRatio(`tanga šířka`, radiusLabel, 2)
  const dRadius = deduce(width, ratio);


  const dCircle = surfaceBaseArea({ radius: last(dRadius) }, {
    surfaceBaseAreaLabel: circleLabel,
    entity2D: entity2d
  });

  const deductionTree = deduce(
    deduce(
      width,
      to(
        dRadius,
        commonSense(`${radiusLabel} = ${tangaHeight}`),
        cont(tangaHeight, (dRadius.children[2] as Container).quantity, entity)),
      product("obsah obdélníku", [], entity2d, entity)
    ),
    deduce(
      cont(`2 krát ${circelPartLabel}`, 2, ""),
      deduce(
        dCircle,
        compRatio(circleLabel, circelPartLabel, 4)),

      product(`dvojice ${circelPartLabel}`, [], entity2d, entity2d)
    )
  )

  const template = highlight => highlight``;

  return { deductionTree, template }
}