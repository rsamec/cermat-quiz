import { html } from "htl";
import { cont, inferenceRule, compRatio, commonSense, ctor } from "../../components/math.js";
import { deduce } from "../../utils/deduce.js";
import { formatNode as format, inputLabel, deduceLabel, highlightLabel } from "../../utils/deduce-components.js";


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
  const agentCurrent = "nová zakázka (změna dělníků)";
  const agentNew = "nová zakázka (změna dělníků i výrobků)";
  const entityA = "dělník";
  const entityB = "hodin";
  const entityC = "výrobek"



  const aPrevious = cont(agentPrevious, input.previousWorkers, entityA);
  const aCurrent = cont(agentCurrent, input.currentWorkers, entityA)
  const dd1 = inferenceRule(aPrevious, aCurrent, ctor('comp-ratio'));

  const cc1 = commonSense("nepřímá úměrnost, obracený poměr veličin")
  const cc2 = commonSense("přímá úměrnost, stejný poměr veličin")
  const dd2 = compRatio(agentPrevious, agentCurrent, dd1.kind == "comp-ratio" ? dd1.quantity : 0, entityB)
  const bPrevious = cont(agentPrevious, input.previousHours, entityB);
  const dd3 = inferenceRule(dd2, bPrevious);

  const c1 = cont(agentCurrent, input.previousGoods, entityC);
  const c2 = cont(agentNew, input.currentGoods, entityC);
  const dd4 = inferenceRule(c1, c2, ctor('comp-ratio'));
  const comp = compRatio(agentNew, agentCurrent, dd4.kind == "comp-ratio" ? dd4.quantity : 0, "hodin")
  const dd5 = inferenceRule(comp, dd3);

  const deductionTree = deduce(
    deduce(
      deduce(
        deduce(
          format(aPrevious, inputLabel(1)),
          format(aCurrent, inputLabel(5)),
          format(dd1, deduceLabel(1))
        ),
        format(cc1),
        format(dd2, deduceLabel(2))
      ),
      format(bPrevious, inputLabel(3)),
      format(dd3, deduceLabel(3)),
    ),
    deduce(
      deduce(format(c1, inputLabel(2)), format(c2, inputLabel(4)), format(dd4, deduceLabel(4))),
      format(cc2),
      format(comp, inputLabel(4))),
    format(dd5, deduceLabel(5))
  )

  const template = html`
    ${highlightLabel()`${input.previousWorkers} dělníků pracují stejným tempem. Tyto dělníci vyrobí ${input.previousGoods} výrobků za ${input.previousHours} hodin.`}.<br/>
    ${deduceLabel(5)}<strong>${highlightLabel(4)`Za jakou dobu vyrobí ${input.currentGoods} výrobků ${input.currentWorkers} dělníků?`}</strong>`;

  return { deductionTree, template }
}