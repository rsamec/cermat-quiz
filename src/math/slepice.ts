import { cont, inferenceRule, commonSense, compRatio, ctor } from "../components/math.js";
import { axiomInput, deduce, to, type DeduceTemplate } from "../utils/deduce-utils.js";


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
  const agentCurrent = "nově sneseno";
  const agentNew = "nově sneseno delší období";
  const entityA = "slepice";
  const entityB = "vejce";
  const entityC = "den"



  const aPrevious = axiomInput(cont(agentPrevious, input.previousWorkers, entityA), 1)
  const aCurrent = axiomInput(cont(agentCurrent, input.currentWorkers, entityA), 4)
  const dd1 = inferenceRule(aPrevious, aCurrent, ctor('comp-ratio'));

  const cc1 = commonSense("přímá úměrnost, stejný poměr veličin")
  const dd2 = compRatio(agentCurrent, agentPrevious, dd1.kind == "comp-ratio" ? dd1.ratio : 0, entityB)
  const bPrevious = axiomInput(cont(agentPrevious, input.previousEggs, entityB), 3);
  const dd3 = inferenceRule(dd2, bPrevious);

  const c1 = axiomInput(cont(agentCurrent, input.previousDays, entityC), 2);
  const c2 = axiomInput(cont(agentNew, input.currentDays, entityC), 5);
  const dd4 = inferenceRule(c1, c2, ctor('comp-ratio'));
  const dd5 = compRatio(agentNew, agentCurrent, dd4.kind == "comp-ratio" ? dd4.ratio : 0, entityB)
  const dd6 = inferenceRule(dd5, dd3);

  const deductionTree = deduce(
    deduce(
      to(
        deduce(
          aPrevious,
          aCurrent,
          ctor('comp-ratio')
        ),
        cc1,
        dd2
      ),
      bPrevious,
    ),
    to(
      deduce(c1, c2, ctor('comp-ratio')),
      cc1,
      dd5))




  const template = (highlight: DeduceTemplate) =>
    highlight`Když v průměru ${input.previousWorkers} slepice za ${input.previousDays} dne snese ${input.previousEggs} vejce.
    ${html => html`</br><strong>${highlight`Kolik vajec pak snesou ${input.currentWorkers} slepic za ${input.currentDays} dny?`}</strong>`}`


  return { deductionTree, template }
}