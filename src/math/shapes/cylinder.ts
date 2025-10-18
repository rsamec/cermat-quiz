
import { contLength, circleArea, cylinderVolume, cylinderArea } from "../../components/math.js";
import { axiomInput, deduce } from "../../utils/deduce-utils.js";


interface Params {
  radius: number
  height: number
}

export function examples({ input }: {
  input: Params,
}) {

  const radiusLabel = "poloměr"
  const heightLabel = "výška"
  

  const radius = axiomInput(contLength(radiusLabel, input.radius), 1);
  const height = axiomInput(contLength(heightLabel, input.height), 2);

  const dTree1 = deduce(radius, circleArea("obsah"))

  const dTree2 = deduce(radius, height, cylinderVolume("objem"))

  const dTree3 = deduce(radius, height, cylinderArea("povrch"))

  const templateBase = highlight => highlight
    `Válec, který má poloměr podstavy ${input.radius} cm a výšku ${input.height} cm.`

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