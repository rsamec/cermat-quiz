import { html } from "htl";
import { cont, inferenceRule, comp, commonSense, ratioComp } from "../utils/math.js";
import { deduce } from "../utils/deduce.js";
import { formatNode as format, inputLabel, deduceLabel, highlight } from "../utils/deduce-components.js";


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
  const dd1 = inferenceRule(aPrevious, aCurrent, { kind: 'comp-r' });

  const cc1 = commonSense("přímá úměrnost, stejný poměr veličin")
  const dd2 = ratioComp(agentCurrent, agentPrevious, dd1.kind == "comp-r" ? dd1.quantity : 0, entityB)
  const bPrevious = cont(agentPrevious, input.previousEggs, entityB);
  const dd3 = inferenceRule(dd2, bPrevious);

  const c1 = cont(agentCurrent, input.previousDays, entityC);
  const c2 = cont(agentNew, input.currentDays, entityC);
  const dd4 = inferenceRule(c1, c2, { kind: 'comp-r' });
  const comp = ratioComp(agentNew, agentCurrent, dd4.kind == "comp-r" ? dd4.quantity : 0, entityB)
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
      format(cc1),
      format(comp, inputLabel(4))),
    format(dd5, deduceLabel(5))
  )


  const template = html`
    ${inputLabel(1)}${highlight`Když v průměru ${input.previousWorkers} slepice za ${input.previousDays} dne snese ${input.previousEggs} vejce.`}
    ${deduceLabel(5)}<strong>${highlight`Kolik vajec pak snesou ${input.currentWorkers} slepic za ${input.currentDays} dne?`}</strong>`;


  return { deductionTree, template }
}