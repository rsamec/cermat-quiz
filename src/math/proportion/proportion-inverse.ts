import { html } from "htl";
import { cont, inferenceRule, ratioComp, commonSense } from "../../utils/math.js";
import { deduce } from "../../utils/deduce.js";
import { formatNode as format, inputLabel, deduceLabel, highlight } from "../../utils/deduce-components.js";


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
  const dd1 = inferenceRule(aCurrent, aPrevious, { kind: 'comp-r' });

  const cc1 = commonSense("nepřímá úměrnost, obracený poměr veličin")
  const compB = ratioComp(agentCurrent, agentPrevious, dd1.kind == "comp-r" ? dd1.quantity : 0, entityB)
  const bPrevious = cont(agentPrevious, input.previousHours, entityB);

  const dd3 = inferenceRule(compB, bPrevious);

  const deductionTree = deduce(
    deduce(
      deduce(
        format(aPrevious, inputLabel(1)),
        format(aCurrent, inputLabel(2)),
        format(dd1, deduceLabel(1))
      ),
      format(cc1),
      format(compB, deduceLabel(2))
    ), 
    format(bPrevious, inputLabel(3)),
    format(dd3, deduceLabel(3)),
  )

  const template = html`
    ${inputLabel(1)}${highlight`${input.previousMachine} strojů zvládne práci za ${input.previousHours} hodin.`}.<br/>
    ${deduceLabel(3)}<strong> ${highlight`Kolik hodin bude trvat stejná práce ${input.currentMachine} strojům?`}</strong>`;

  return { deductionTree, template }
}