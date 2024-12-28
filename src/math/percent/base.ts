import { html } from "htl";
import { cont, inferenceRule } from "../../utils/math.js";
import { deduce } from "../../utils/deduce.js";
import { formatNode as format, inputLabel, deduceLabel, highlight } from "../../utils/deduce-components.js";


interface PercentBaseParams {
  part: number;
  percentage: number;
}
export default function build({ input }: {
  input: PercentBaseParams,
}) {

  const agentPercentBase = "vypůjčeno";
  const agentPercentPart = "úrok";
  const entity = "Kč";
  const entityPercent = "%"

  const percent = cont(agentPercentPart, input.percentage, entityPercent);
  const celek = cont(agentPercentBase, 100, entityPercent);
  const dd1 = inferenceRule(percent, celek, { kind: 'ratio' });

  const percentPart = cont(agentPercentPart, input.part, entity);
  const dd2 = inferenceRule(percentPart, dd1);

  const deductionTree = deduce(
    deduce(
      format(percent, inputLabel(2)),
      format(celek),
      format(dd1, deduceLabel(1))
    ),
    format(percentPart, inputLabel(1)),
    format(dd2, deduceLabel(2))
  )


  const template = html`
    ${inputLabel(1)}${highlight`Zaplaceno na úrocích ${input.part} Kč za jeden rok.`}.
    ${inputLabel(2)}${highlight`Úrok ${input.percentage} % na jeden rok.`}.<br/>
    ${deduceLabel(2)}<strong> ${highlight`Kolik bylo půjčeno před rokem v Kč?`}</strong>`;

  return { deductionTree, template }
}