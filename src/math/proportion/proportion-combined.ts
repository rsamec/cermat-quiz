import { html } from "htl";
import { cont, inferenceRule, ratioComp, commonSense } from "../../utils/math.js";
import { deduce } from "../../utils/deduce.js";
import { formatNode as format, inputLabel, deduceLabel, highlight } from "../../utils/deduce-components.js";


interface InversProportionParams {
  previousWorkers: number;
  previousHours: number;
  currentWorkers: number;
  previousGoods: number
  currentGoods: number
}
export default function build({ input }: {
  input: InversProportionParams,
}) {

  const agentPrevious = "původní zakázka";
  const agentCurrent = "zakázka";
  const agentNew = "nová zakázka";
  const entityA = "dělník";
  const entityB = "hodin";
  const entityC = "výrobek"



  const aPrevious = cont(agentPrevious, input.previousWorkers, entityA);
  const aCurrent = cont(agentCurrent, input.currentWorkers, entityA)
  const dd1 = inferenceRule(aPrevious, aCurrent, { kind: 'comp-r' });

  const cc1 = commonSense("nepřímá úměrnost, obracený poměr veličin")
  const dd2 = ratioComp(agentPrevious, agentCurrent, dd1.kind == "comp-r" ? dd1.quantity : 0, entityB)
  const bPrevious = cont(agentPrevious, input.previousHours, entityB);
  const dd3 = inferenceRule(dd2, bPrevious);

  const c1 = cont(agentCurrent, input.previousGoods, entityC);
  const c2 = cont(agentNew, input.currentGoods, entityC);
  const dd4 = inferenceRule(c1, c2, { kind: 'comp-r' });
  const comp = ratioComp(agentNew, agentCurrent, dd4.kind == "comp-r" ? dd4.quantity : 0, "hodin")
  const dd5 = inferenceRule(comp, dd3);

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
    deduce(
      deduce(format(c1), format(c2), format(dd4, deduceLabel(4))),
      format(comp, inputLabel(4))),
    format(dd5, deduceLabel(5))
  )

  const template = html`
    ${inputLabel(1)}${highlight`${input.previousWorkers} dělníků pracují stejným tempem.`}
    ${inputLabel(2)}${highlight`Tyto dělníci vyrobí ${input.previousGoods} výrobků za ${input.previousHours} hodin.`}.<br/>
    ${deduceLabel(5)}<strong>${highlight`Za jakou dobu vyrobí ${input.currentGoods} výrobků ${input.currentWorkers} dělníků?`}</strong>`;

  return { deductionTree, template }
}