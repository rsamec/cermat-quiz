
import { cont, inferenceRule, compRatio, commonSense, ctor, proportion } from "../../components/math.js";
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
  const bPrevious = axiomInput(cont(agentPrevious, input.previousHours, entityB), 2);
  const comp = compRatio(agentNew, agentCurrent, 3 / 2)


  const deductionTree = deduce(

    deduce(
      deduce(
        deduce(
          aPrevious,
          aCurrent,
          ctor('comp-ratio')
        ),
        proportion(true, [`švadleny`, `hodiny`])
      ),
      bPrevious,
    ),
    deduce(
      comp,
      proportion(false, [`množství`, `hodin`])
    )
  )

  const template = highlight => highlight`${input.previousWorker} švadlen, které šijí oblečení, pracují stejným tempem.
    Tyto švadleny splní danou zakázku za ${input.previousHours} hodin.
    Za jakou dobu splní o polovinu větší zakázku ${input.currentWorker} švadleny?`;

  return { deductionTree, template }
}