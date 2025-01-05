import { html } from "htl";
import { cont, ctor, inferenceRule } from "../../components/math.js";
import { deduce } from "../../utils/deduce.js";
import { formatNode as format, inputLabel, deduceLabel, highlight } from "../../utils/deduce-components.js";


interface PercentPercentageParams {
  part: number;
  base: number;
}
export default function build({ input }: {
  input: PercentPercentageParams,
}) {

  const agentPercentBase = "vypůjčeno";
  const agentPercentPart = "úrok";
  const entity = "Kč";
  const entityPercent = "%"
  
  

  const percentPart = cont(agentPercentPart, input.part, entity);
  const percentBase = cont(agentPercentBase, input.base, entity);
  const dd1 = inferenceRule(percentPart, percentBase, ctor('ratio'));

  const celek = cont(agentPercentBase, 100, entityPercent);
  const dd2 = inferenceRule(celek, dd1);

  const deductionTree = deduce(
    deduce(
      format(percentBase, inputLabel(1)),
      format(percentPart, inputLabel(2)),
      format(dd1, deduceLabel(1))
    ),
    format(celek),
    format(dd2, deduceLabel(2))
  )


  const template = html`
    ${inputLabel(1)}${highlight`Zaplaceno na úrocích ${input.part} Kč za jeden rok.`}
    ${inputLabel(2)}${highlight`Půjčeno ${input.base} Kč.`}<br/>
    ${deduceLabel(2)}<strong> ${highlight`Kolik procent činí úrok?`}</strong>`;

  return { deductionTree, template }
}