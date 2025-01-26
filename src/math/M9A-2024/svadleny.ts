
import { cont, inferenceRule, compRatio, commonSense, ctor } from "../../components/math.js";
import { axiomInput, deduce, to } from "../../utils/deduce-utils.js";


interface InversProportionParams {
  previousWorker: number;
  previousHours: number;
  currentWorker: number;
}
export default function build({ input }: {
  input: InversProportionParams,
}) {

  const agentPrevious = "původní zakázka";
  const agentCurrent = "nová zakázka";
  const agentNew = "rozšířená nová zakázka";
  const entityA = "švadlen";
  const entityB = "hodin";



  const aPrevious = axiomInput(cont(agentPrevious, input.previousWorker, entityA), 1);
  const aCurrent = axiomInput(cont(agentCurrent, input.currentWorker, entityA), 3)
  const dd1 = inferenceRule(aPrevious, aCurrent, ctor('comp-ratio'));

  const cc1 = commonSense("nepřímá úměrnost (méně švadlen - více hodin)")
  const cc2 = commonSense("přímá úměrnost (více množství - více hodin)")
  const dd2 = compRatio(agentCurrent, agentPrevious, dd1.kind == "comp-ratio" ? 1 / dd1.ratio : 0)
  const bPrevious = axiomInput(cont(agentPrevious, input.previousHours, entityB), 2);
  const dd3 = inferenceRule(dd2, bPrevious);

  const comp = compRatio(agentNew, agentCurrent, 3 / 2)
  const dd4 = compRatio(agentNew, agentCurrent, 3 / 2)
  const dd5 = inferenceRule(dd4, dd3);


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
      comp,
      cc2,
      dd4),
  )

  const template = highlight => highlight`${input.previousWorker} švadlen, které šijí oblečení, pracují stejným tempem.
    Tyto švadleny splní danou zakázku za ${input.previousHours} hodin.
    Za jakou dobu splní o polovinu větší zakázku ${input.currentWorker} švadleny?`;

  return { deductionTree, template }
}