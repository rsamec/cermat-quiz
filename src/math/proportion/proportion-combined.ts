
import { cont, ctor, proportion } from "../../components/math.js";
import { axiomInput, deduce } from "../../utils/deduce-utils.js";


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



  const aPrevious = axiomInput(cont(agentPrevious, input.previousWorkers, entityA), 1);
  const aCurrent = axiomInput(cont(agentCurrent, input.currentWorkers, entityA), 5);
  const bPrevious = axiomInput(cont(agentPrevious, input.previousHours, entityB), 3);


  const c1 = axiomInput(cont(agentCurrent, input.previousGoods, entityC), 2);
  const c2 = axiomInput(cont(agentNew, input.currentGoods, entityC), 4);

  const deductionTree = deduce(
    deduce(
      deduce(
        deduce(
          aPrevious,
          aCurrent,
          ctor('comp-ratio')
        ),
        proportion(true)
      ),
      bPrevious
    ),
    deduce(
      deduce(c1, c2, ctor('comp-ratio')),
      proportion(false))
  )

  const template = highlight => highlight`
    ${input.previousWorkers} dělníků pracují stejným tempem. Tyto dělníci vyrobí ${input.previousGoods} výrobků za ${input.previousHours} hodin.
    Za jakou dobu vyrobí ${input.currentGoods} výrobků ${input.currentWorkers} dělníků?`;

  return { deductionTree, template }
}