
import { cont, ctor, proportion } from "../../components/math.js";
import { axiomInput, deduce } from "../../utils/deduce-utils.js";


interface InversProportionParams {
  previousMachine: number;
  currentMachine: number;
  previousCount: number;
}
export default function build({ input }: {
  input: InversProportionParams,
}) {

  const agentPrevious = "vyrobeno původně";
  const agentCurrent = "vyrobeno nově";
  const entityA = "strojů";
  const entityB = "výrobků";

  const aPrevious = axiomInput(cont(agentPrevious, input.previousMachine, entityA), 1);
  const aCurrent = axiomInput(cont(agentCurrent, input.currentMachine, entityA), 3);
  const bPrevious = axiomInput(cont(agentPrevious, input.previousCount, entityB), 2);


  const deductionTree = deduce(
    deduce(
      deduce(
        aPrevious,
        aCurrent,
        ctor('comp-ratio')
      ),
      proportion(false),
    ),
    bPrevious
  )

  const template = highlight => highlight` 
    ${input.previousMachine} strojů zvládne vyrobit ${input.previousCount} výrobků.
    Kolik výrobků zvládne vyrobit ${input.currentMachine} strojů za stejnou dobu?`;

  return { deductionTree, template }
}