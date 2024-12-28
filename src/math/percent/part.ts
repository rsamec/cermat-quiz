import { html } from "htl";
import { cont, inferenceRule } from "../../utils/math.js";
import { deduce } from "../../utils/deduce.js";
import { formatNode as format, inputLabel, deduceLabel, highlight } from "../../utils/deduce-components.js";


interface PercentPartParams {
  base: number;
  percentage: number;
}
export default function build({ input }: {
  input: PercentPartParams,
}) {

  const agentPercentBase = "vypůjčeno";
  const agentPercentPart = "úrok";
  const entity = "Kč";
  const entityPercent = "%"

  const percent = cont(agentPercentPart, input.percentage, entityPercent);
  const celek = cont(agentPercentBase, 100, entityPercent);
  const dd1 = inferenceRule(percent, celek, { kind: 'ratio' });

  const percentBase = cont(agentPercentBase, input.base, entity);
  const dd2 = inferenceRule(percentBase, dd1);

  const deductionTree = deduce(
    deduce(
      format(percent, inputLabel(2)),
      format(celek),
      format(dd1, deduceLabel(1))
    ),
    format(percentBase, inputLabel(1)),
    format(dd2, deduceLabel(2))
  )


  const template = html`
    ${inputLabel(1)}${highlight`Vypůjčeno ${input.base} Kč na jeden rok.`}.
    ${inputLabel(2)}${highlight`Úrok ${input.percentage} % na jeden rok.`}.<br/>
    ${deduceLabel(2)}<strong> ${highlight`Kolik je úrok v Kč?`}</strong>`;

  return { deductionTree, template }
}