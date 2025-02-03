import { cont, ctor, proportion } from "../components/math.js";
import { axiomInput, deduce} from "../utils/deduce-utils.js";


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
  const bPrevious = axiomInput(cont(agentPrevious, input.previousEggs, entityB), 3);

  const c1 = axiomInput(cont(agentCurrent, input.previousDays, entityC), 2);
  const c2 = axiomInput(cont(agentNew, input.currentDays, entityC), 5);

  const deductionTree = deduce(
    deduce(
      deduce(
        deduce(
          aCurrent,
          aPrevious,
          ctor('comp-ratio')
        ),
        proportion(false,["slepice", "vejce"]),
      ),
      bPrevious,
    ),
    deduce(
      deduce(c2, c1, ctor('comp-ratio')),
      proportion(false, ["den", "vejce"])
    ))

  const template = highlight =>
    highlight`Když v průměru ${input.previousWorkers} slepice za ${input.previousDays} dne snese ${input.previousEggs} vejce.
    ${html => html`</br><strong>${highlight`Kolik vajec pak snesou ${input.currentWorkers} slepic za ${input.currentDays} dny?`}</strong>`}`


  return { deductionTree, template }
}