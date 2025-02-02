import { cont, ctor, proportion } from "../../components/math.js";
import { axiomInput, deduce } from "../../utils/deduce-utils.js";


interface InversProportionParams {
  previousMachine: number;
  previousHours: number;
  currentMachine: number;
}
export default function build({ input }: {
  input: InversProportionParams,
}) {

  const agentPrevious = "práce původně";
  const agentCurrent = "práce nově";
  const entityA = "strojů";
  const entityB = "hodin";

  const aPrevious = axiomInput(cont(agentPrevious, input.previousMachine, entityA), 1);
  const aCurrent = axiomInput(cont(agentCurrent, input.currentMachine, entityA), 3)
  const bPrevious = axiomInput(cont(agentPrevious, input.previousHours, entityB), 2);


  const deductionTree = deduce(
    deduce(
      deduce(
        aPrevious,
        aCurrent,
        ctor('comp-ratio')
      ),
      proportion(true)
    ),
    bPrevious
  )

  const template = highlight => highlight`
    ${input.previousMachine} strojů zvládne práci za ${input.previousHours} hodin.
    Kolik hodin bude trvat stejná práce ${input.currentMachine} strojům?`;

  return { deductionTree, template }
}