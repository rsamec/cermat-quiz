
import { cont, comp, ctor } from "../../components/math.js";
import { axiomInput, deduce, type DeduceTemplate } from "../../utils/deduce-utils.js";


interface PocetObyvatelParams {
  jihlavaPlus: number;
  celkem: number;
}
export default function build({ input }: {
  input: PocetObyvatelParams,
}) {
  const rozdil = input.celkem - input.jihlavaPlus;
  const halfTotal = Math.round(rozdil / 2)
  const jihlava = "Jihlava"
  const trebic = "Třebíč"

  const data = [{ value: halfTotal, agent: jihlava }, { value: halfTotal, agent: trebic }, { value: input.jihlavaPlus, agent: jihlava, opacity: 0.6, }]
  const celkem = 'Jihlava a Třebíč';
  const entity = "obyvatel";

  const total = axiomInput(cont(celkem, input.celkem, entity), 1)
  //const plus = diff(celkem, partCelkem, input.jihlavaPlus, entity)
  const diffComp = axiomInput(comp(jihlava, trebic, input.jihlavaPlus, entity), 2)


  const deductionTree = deduce(
    total,
    diffComp,
    ctor('comp-part-eq'),
  )

  const template = (highlight: DeduceTemplate) => highlight
    `Města Jihlava a Třebíč mají dohromady ${input.celkem.toLocaleString("cs-CZ")} obyvatel.
    Jihlava má o ${input.jihlavaPlus.toLocaleString("cs-CZ")} více.
  ${html => html`<br/>
    <strong> Kolik obyvatel má Třebíč?</strong>`}`;

  return { deductionTree, data, template }
}