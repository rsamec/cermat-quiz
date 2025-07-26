import { cont, combine, ctor } from "../components/math";
import { deduce, axiomInput } from "../utils/deduce-utils";

export const compass = () => {
  const agent = "nákup kružítek";
  const entityPrice = "korun";

  return {
    deductionTree: deduce(
      deduce(
        deduce(
          axiomInput(cont("chybělo", 160, entityPrice), 2),
          axiomInput(cont("zbylo", 100, entityPrice), 3),
          combine(agent, [], entityPrice, entityPrice)
        ),
        axiomInput(cont(agent, 2, "kus"), 1),
        ctor('rate')),
      axiomInput(cont(agent, 4, "kus"), 4)
    )
  }
}

