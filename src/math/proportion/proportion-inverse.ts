import { html } from "htl";
import { cont, inferenceRule, compRatio, commonSense, ctor } from "../../components/math.js";
import { deduce } from "../../utils/deduce.js";
import { formatNode as format, inputLabel, deduceLabel, highlightLabel } from "../../utils/deduce-components.js";


interface InversProportionParams {
  previousMachine: number;
  previousHours: number;
  currentMachine: number;
}
export default function build({ input }: {
  input: InversProportionParams,
}) {

  const agentPrevious = "práce původně";
  const agentCurrent = "práce nově";
  const entityA = "strojů";
  const entityB = "hodin";

  const aPrevious = cont(agentPrevious, input.previousMachine, entityA);
  const aCurrent = cont(agentCurrent, input.currentMachine, entityA)
  const dd1 = inferenceRule(aCurrent, aPrevious, ctor('comp-ratio'));

  const cc1 = commonSense("nepřímá úměrnost, obracený poměr veličin")
  const compB = compRatio(agentCurrent, agentPrevious, dd1.kind == "comp-ratio" ? dd1.ratio : 0)
  const bPrevious = cont(agentPrevious, input.previousHours, entityB);

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
    ${highlightLabel()`${input.previousMachine} strojů zvládne práci za ${input.previousHours} hodin.`}.<br/>
    ${deduceLabel(3)}<strong> ${highlightLabel(3)`Kolik hodin bude trvat stejná práce ${input.currentMachine} strojům?`}</strong>`;

  return { deductionTree, template }
}