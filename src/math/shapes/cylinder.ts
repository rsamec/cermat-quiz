
import { cont, pi, product, ratio, sum } from "../../components/math.js";
import { axiomInput, deduce, deduceLbl, highlight } from "../../utils/deduce-utils.js";


interface Params {
  diameter: number
  height: number
}

export default function build({ input }: {
  input: Params,
}) {
  const area = "obsah"
  const diameterLabel = "průměr"
  const radiusLabel = "poloměr"
  const heightLabel = "výška"
  const entity = "cm"
  const entity2D = "čtverečků"
  const entity3D = "krychliček"

  const diameter = axiomInput(cont(diameterLabel, input.diameter, entity), 1);
  const height = axiomInput(cont(heightLabel, input.height, entity), 2);


  const dRadius = deduce(
    diameter,
    ratio({ agent: diameterLabel, entity }, { agent: radiusLabel, entity }, 1 / 2),
  )

  const dCircleArea =
    deduce(
      dRadius,
      { ...dRadius.children[2], ...deduceLbl(1) },
      pi(),
      product("obsah podstavy", [radiusLabel, radiusLabel, "PI"], entity2D, entity)
    )

  const dTree1 = dCircleArea;

  const dTree2 = deduce(
    dCircleArea,
    height,
    product("objem válce", ["obsah podstavy", heightLabel], entity3D, entity)
  )

  const dCirclePerimetr = deduce(
    cont("2xPI", 2 * pi().quantity, ""),
    { ...dRadius.children[2], ...deduceLbl(1) },
    product("obvod podstavy", ["2 * PI", radiusLabel], entity, entity)
  )

  const protilehlaStana = cont("počet stěn", 2, "");
  const dTree3 = deduce(
    deduce(
      dCircleArea,
      protilehlaStana,
      product("spodní a horní stěna", [], entity2D, entity)
    ),
    deduce(
      dCirclePerimetr,
      height,
      product("obsah bočního pláště", ["obvod podstavy", heightLabel], entity2D, entity)
    ),
    sum("obsah pláště", [], entity2D, entity2D)
  )

  const templateBase = highlight => highlight
    `Válec, který má průměr podstavy ${input.diameter} cm a výšku ${input.height} cm.`

  const template1 = html => html`<br/>
    <strong>Vypočtěte obsah podstavy.</strong>`;

  const template2 = html => html`<br/>
    <strong>Vypočtěte objem válce.</strong>`;

  const template3 = html => html`<br/>
    <strong>Vypočtěte obsah pláště válce.</strong>`;


  return [
    { deductionTree: dTree1, template: highlight => highlight`${() => templateBase(highlight)}${template1}` },
    { deductionTree: dTree2, template: highlight => highlight`${() => templateBase(highlight)}${template2}` },
    { deductionTree: dTree3, template: highlight => highlight`${() => templateBase(highlight)}${template3}` },
  ]
}