
import { cont, ctor, proportion } from "../../components/math";
import { axiomInput, deduce } from "../../utils/deduce-utils";


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

  const deductionTree = deduce(
    deduce(
      deduce(
        axiomInput(cont(agentCurrent, input.currentMachine, entityA), 3),
        axiomInput(cont(agentPrevious, input.previousMachine, entityA), 1),
        ctor('comp-ratio')
      ),
      proportion(false, [entityA, entityB]),
    ),
    axiomInput(cont(agentPrevious, input.previousCount, entityB), 2)
  )

  const template = highlight => highlight` 
    ${input.previousMachine} strojů zvládne vyrobit ${input.previousCount} výrobků.
    Kolik výrobků zvládne vyrobit ${input.currentMachine} strojů za stejnou dobu?`;

  return { deductionTree, template }
}