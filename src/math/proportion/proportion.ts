import { html } from "htl";
import { cont, inferenceRule, compRatio, commonSense, ctor } from "../../components/math.js";
import { deduce } from "../../utils/deduce.js";
import { formatNode as format, inputLabel, deduceLabel, highlightLabel } from "../../utils/deduce-components.js";


interface InversProportionParams {
  previousMachine: number;
  currentMachine: number;

  previousCount: number;
}
export default function build({ input }: {
  input: InversProportionParams,
}) {

  const agentPrevious = "vyrobeno původně";
  const agentCurrent = "vyrobeno nově";
  const entityA = "strojů";
  const entityB = "výrobků";

  const aPrevious = cont(agentPrevious, input.previousMachine, entityA);
  const aCurrent = cont(agentCurrent, input.currentMachine, entityA)
  const dd1 = inferenceRule(aCurrent, aPrevious, ctor('comp-ratio'));

  const cc1 = commonSense("přímá úměrnost, stejný poměru veličin")
  const compB = compRatio(agentPrevious, agentCurrent, dd1.kind == "comp-ratio" ? dd1.ratio : 0, entityB)
  const bPrevious = cont(agentPrevious, input.previousCount, entityB);

  const dd3 = inferenceRule(compB, bPrevious);

  const deductionTree = deduce(
    deduce(
      deduce(
        format(aPrevious, inputLabel(1)),
        format(aCurrent, inputLabel(3)),
        format(dd1, deduceLabel(1))
      ),
      format(cc1),
      format(compB, deduceLabel(2))
    ), 
    format(bPrevious, inputLabel(2)),
    format(dd3, deduceLabel(3)),
  )

  const template = html`
    ${highlightLabel()`${input.previousMachine} strojů zvládne vyrobit ${input.previousCount} výrobků.`}.<br/>
    ${deduceLabel(3)}<strong> ${highlightLabel(3)`Kolik výrobků zvládne vyrobit ${input.currentMachine} strojů za stejnou dobu?`}</strong>`;

  return { deductionTree, template }
}