import { html } from "htl";
import { cont, inferenceRule, comp, commonSense, ratioComp } from "../utils/math.js";
import { deduce } from "../utils/deduce.js";
import { formatNode as format, inputLabel, deduceLabel, highlightLabel } from "../utils/deduce-components.js";


interface InversProportionParams {
  previousWorkers: number;
  previousEggs: number;
  currentWorkers: number;
  previousDays: number
  currentDays: number
}

export default function build({ input }: {
  input: InversProportionParams,
}) {
  const agentPrevious = "původně sneseno";
  const agentCurrent = "nově sneseno (více slepic)";
  const agentNew = "nově sneseno (více slepic, více dní)";
  const entityA = "slepice";
  const entityB = "vejce";
  const entityC = "den"



  const aPrevious = cont(agentPrevious, input.previousWorkers, entityA);
  const aCurrent = cont(agentCurrent, input.currentWorkers, entityA)
  const dd1 = inferenceRule(aPrevious, aCurrent, { kind: 'comp-ratio' });

  const cc1 = commonSense("přímá úměrnost, stejný poměr veličin")
  const dd2 = ratioComp(agentCurrent, agentPrevious, dd1.kind == "comp-ratio" ? dd1.quantity : 0, entityB)
  const bPrevious = cont(agentPrevious, input.previousEggs, entityB);
  const dd3 = inferenceRule(dd2, bPrevious);

  const c1 = cont(agentCurrent, input.previousDays, entityC);
  const c2 = cont(agentNew, input.currentDays, entityC);
  const dd4 = inferenceRule(c1, c2, { kind: 'comp-ratio' });
  const comp = ratioComp(agentNew, agentCurrent, dd4.kind == "comp-ratio" ? dd4.quantity : 0, entityB)
  const dd5 = inferenceRule(comp, dd3);

  const deductionTree = deduce(
    deduce(
      deduce(
        deduce(
          format(aPrevious, inputLabel(1)),
          format(aCurrent, inputLabel(4)),
          format(dd1, deduceLabel(1))
        ),
        format(cc1),
        format(dd2, deduceLabel(2))
      ),
      format(bPrevious, inputLabel(3)),
      format(dd3, deduceLabel(3)),
    ),
    deduce(
      deduce(format(c1, inputLabel(2)), format(c2, inputLabel(5)), format(dd4, deduceLabel(4))),
      format(cc1),
      format(comp, deduceLabel(5))),
    format(dd5, deduceLabel(6))
  )


  const template = html`
    ${highlightLabel(1)`Když v průměru ${input.previousWorkers} slepice za ${input.previousDays} dne snese ${input.previousEggs} vejce.`}
    ${deduceLabel(6)}<strong>${highlightLabel(4)`Kolik vajec pak snesou ${input.currentWorkers} slepic za ${input.currentDays} dny?`}</strong>`;


  return { deductionTree, template }
}