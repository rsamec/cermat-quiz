import { html } from "htl";
import { cont, inferenceRule,comp } from "../utils/math.js";
import { deduce } from "../utils/deduce.js";
import { formatNode as format, inputLabel, deduceLabel, highlight } from "../utils/deduce-components.js";


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

  const total = cont(celkem, input.celkem, entity)
  //const plus = diff(celkem, partCelkem, input.jihlavaPlus, entity)
  const diffComp = comp(jihlava, trebic, input.jihlavaPlus, entity)


  const dd1 = inferenceRule(total, diffComp, { kind: 'comp-part-eq' });
  const deductionTree = deduce(
      format(total, inputLabel(1)),
      format(diffComp, inputLabel(2)),
      format({kind:'comp-part-eq'}),
      format(dd1, deduceLabel(1))
  )

  const template = html`
    ${inputLabel(1)}${highlight`Města Jihlava a Třebíč mají dohromady ${input.celkem.toLocaleString("cs-CZ")} obyvatel.`}
    ${inputLabel(2)}${highlight`Jihlava má o ${input.jihlavaPlus.toLocaleString("cs-CZ")} více`}.<br/>
    ${deduceLabel(1)}<strong> Kolik obyvatel má Třebíč?</strong>`;

  return { deductionTree, data, template }
}