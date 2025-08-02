
import { productCombine, cont, type Container, product, sum, repeat } from "../../components/math.js";
import { axiomInput, deduce } from "../../utils/deduce-utils.js";


interface Params {
  width: number
  length: number
  height: number
}

export function volume(
  { width, length, height }: { width: Container, length: Container, height: Container, },
  options?: {
    widthLabel?: string
    lenghtLabbel?: string
    heightLabel?: string
    entity?: string,
    entity3D?: string,
    volumeLabel?: string,
  }) {
  const { heightLabel, widthLabel, lengthLabel, entity3D, volumeLabel } = {
    ...{
      widthLabel: "šířka",
      lengthLabel: "délka",
      heightLabel: "výška",
      entity3D: "krychliček",
      volumeLabel: "objem"

    },
    ...options ?? {}
  }
  return deduce(
    length,
    width,
    height,
    productCombine(volumeLabel, entity3D, [lengthLabel, widthLabel, heightLabel])
  )

}


export function examples({ input }: {
  input: Params,
}) {
  const widthLabel = "šířka"
  const lengthLabel = "délka"
  const heightLabel = "výška"
  const entity = "cm"
  const entity2D = "čtverečků"


  const width = axiomInput(cont(widthLabel, input.width, entity), 1);
  const length = axiomInput(cont(lengthLabel, input.length, entity), 2);
  const height = axiomInput(cont(lengthLabel, input.height, entity), 3);



  const dBase =
    deduce(
      length,
      width,
      productCombine("obsah podstavy", entity2D, [lengthLabel, widthLabel])
    )

  const dTree1 = dBase;

  const dTree2 = volume({ length, width, height });

  const protilehlaStana = repeat("počet stěn", 2);

  const dTree3 =
    deduce(
      deduce(
        dBase,
        protilehlaStana,
        product("spodní a horní stěna")),
      deduce(
        deduce(
          width,
          height,
          productCombine("boční stěna", entity2D, [widthLabel, heightLabel])
        ),
        protilehlaStana,
        product("obě boční stěny")),
      deduce(
        deduce(
          length,
          height,
          productCombine("přední stěna", entity2D, [lengthLabel, heightLabel])
        ),
        protilehlaStana,
        product("přední a zadní stěna")),
      sum("obsah pláště")
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