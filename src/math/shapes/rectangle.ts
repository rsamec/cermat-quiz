
import { cont, product, sum } from "../../components/math.js";
import { axiomInput, deduce, highlight } from "../../utils/deduce-utils.js";


interface Params {
  width: number
  length: number
  height: number

}
export default function build({ input }: {
  input: Params,
}) {
  const area = "obsah"
  const widthLabel = "šířka"
  const lengthLabel = "délka"
  const heightLabel = "výška"
  const entity = "cm"
  const entity2D = "cm čtverečních"

  const width = axiomInput(cont(widthLabel, input.width, entity), 1);
  const length = axiomInput(cont(lengthLabel, input.length, entity), 2);
  const height = axiomInput(cont(lengthLabel, input.length, entity), 3);



  const dBase =
    deduce(
      length,
      width,
      product("obsah podstavy", [lengthLabel, widthLabel], entity2D, entity)
    )

  const dTree1 = dBase;

  const dTree2 = deduce(
    length,
    width,
    height,
    product("objem", [lengthLabel, widthLabel, heightLabel], "cm krychlových", entity)
  )

  const dTree3 = deduce(
    cont("počet stěn", 2, ""),
    deduce(
      dBase,
      deduce(
        width,
        height,
        product("boční stěna", [widthLabel, heightLabel], entity2D, entity)
      ),
      deduce(
        width,
        height,
        product("přední stěna", [lengthLabel, heightLabel], entity2D, entity)
      ),
      sum("obsah pláště", [], entity2D, entity2D)),
    product("vsechny steny", [], entity2D, entity)
  )


  const templateBase = highlight => highlight
    `Šírka kvádru je ${input.width} cm, délka je ${input.length} cm a výška je ${input.height}.`

  const template1 = html => html`<br/>
    <strong>Vypočtěte obsah podstavy kvádru.</strong>`;

  const template2 = html => html`<br/>
    <strong>Vypočítejte objem kvádru.</strong>`;

  const template3 = html => html`<br/>
    <strong>Vypočítejte obsah všech stěn kvádru?</strong>`;

  return [
    { deductionTree: dTree1, template: highlight => highlight`${() => templateBase(highlight)}${template1}` },
    { deductionTree: dTree2, template: highlight => highlight`${() => templateBase(highlight)}${template2}` },
    { deductionTree: dTree3, template: highlight => highlight`${() => templateBase(highlight)}${template3}` }
  ]
}