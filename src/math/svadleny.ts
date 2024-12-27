import { html } from "htl";
import { cont, inferenceRule, ratio, diff, ratioComp, commonSense } from "../utils/math.js";
import { deduce } from "../utils/deduce.js";
import { formatNode as format, inputLabel, deduceLabel, highlight } from "../utils/deduce-components.js";


interface InversProportionParams {
  previousWorker: number;
  previousHours: number;
  currentWorker: number;
}
export default function build({ input }: {
  input: InversProportionParams,
}) {

  const agentPrevious = "původní zakázka";
  const agentCurrent = "zakázka";
  const agentNew = "nová zakázka";
  const entityA = "švadlen";
  const entityB = "hodin";



  const aPrevious = cont(agentPrevious, input.previousWorker, entityA);
  const aCurrent = cont(agentCurrent, input.currentWorker, entityA)
  const dd1 = inferenceRule(aCurrent, aPrevious, { kind: 'comp-r' });

  const cc1 = commonSense("nepřímá úměrnost")
  const dd2 = ratioComp(agentCurrent, agentPrevious, dd1.kind == "comp-r" ? dd1.quantity : 0, entityB)
  const bPrevious = cont(agentPrevious, input.previousHours, entityB);
  const dd3 = inferenceRule(dd2, bPrevious);

  const comp = ratioComp(agentNew, agentCurrent, 3 / 2, "hodin")
  const dd4 = inferenceRule(comp, dd3);

  const deductionTree = deduce(
    deduce(
      deduce(
        deduce(
          format(aPrevious, inputLabel(1)),
          format(aCurrent, inputLabel(3)),
          format(dd1, deduceLabel(1))
        ),
        format(cc1),
        format(dd2, deduceLabel(2))
      ),
      format(bPrevious, inputLabel(2)),
      format(dd3, deduceLabel(3)),
    ),
    format(comp, inputLabel(4)),
    format(dd4, deduceLabel(4))


  )

  const template = html`
    ${inputLabel(1)}${highlight`${input.previousWorker} švadlen, které šijí oblečení, pracují stejným tempem.`}
    ${inputLabel(2)}${highlight`Tyto švadleny splní danou zakázku za ${input.previousHours} hodin.`}.<br/>
    ${deduceLabel(4)}<strong>${highlight`Za jakou dobu splní o polovinu větší zakázku ${input.currentWorker} švadleny?`}</strong>`;

  return { deductionTree, template }
}