
import { compRatio, cont, product, sum } from "../../components/math";
import { axiomInput, deduce } from "../../utils/deduce-utils";


interface Params {
  a: number
  b: number
  c: number
  aHeight: number
  height: number

}
export function examples({ input }: {
  input: Params,
}) {
  const area = "obsah"
  const sizeLabel = "velikost strany"
  const heightLabel = "výška"
  const entity = "cm"
  const entity2D = "čtverečků"
  const entity3D = "krychliček"

  const a = axiomInput(cont(sizeLabel, input.a, entity), 1);
  const b = axiomInput(cont(sizeLabel, input.b, entity), 2);
  const c = axiomInput(cont(sizeLabel, input.c, entity), 3);
  const aHeight = axiomInput(cont(sizeLabel, input.aHeight, entity), 4);
  const height = axiomInput(cont(heightLabel, input.height, entity), 5);



  const dBaseArea =
    deduce(
      deduce(
        a,
        aHeight,
        product("obsah obdelník", [sizeLabel, heightLabel], entity2D, entity)
      ),
      compRatio("obsah obdelník", "obsah trojúhelník", 2),
    )

  const dTree1 = dBaseArea;

  const dTree2 = deduce(
    dBaseArea,
    height,
    product("objem hranolu", ["obsah podstavy", heightLabel], entity3D, entity)
  )

  const dPerimetr = deduce(
    a,
    b,
    c,
    sum("obvod podstavy", ["a", "b", "c"], entity, entity)
  )

  const protilehlaStana = cont("počet stěn", 2, "");
  const dTree3 = deduce(
    deduce(
      dBaseArea,
      protilehlaStana,
      product("spodní a horní stěna", [], entity2D, entity)
    ),
    deduce(
      dPerimetr,
      height,
      product("obsah bočního pláště", ["obvod podstavy", heightLabel], entity2D, entity)
    ),
    sum("obsah pláště", [], entity2D, entity2D)
  )

  const templateBase = highlight => highlight
    `Trojboký hranol s podstavou o stranách a=${input.a} cm, b=${input.a} cm, c=${input.a} cm a výškou ${input.aHeight} cm ke straně a. Výška hranolu je ${input.height} cm.`

  const template1 = html => html`<br/>
    <strong>Vypočtěte obsah podstavy hranolu?.</strong>`;

  const template2 = html => html`<br/>
    <strong>Vypočtěte objem hranulu.</strong>`;

  const template3 = html => html`<br/>
    <strong>Vypočtěte obsah pláště hranolu.</strong>`;

  return [
    { deductionTree: dTree1, template: highlight => highlight`${() => templateBase(highlight)}${template1}` },
    { deductionTree: dTree2, template: highlight => highlight`${() => templateBase(highlight)}${template2}` },
    { deductionTree: dTree3, template: highlight => highlight`${() => templateBase(highlight)}${template3}` },

  ]
}