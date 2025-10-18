
import { cont, ctorPercent } from "../../components/math.js";
import { axiomInput, deduce } from "../../utils/deduce-utils.js";

export function example({ input }: {
  input: {
    part: number;
    base: number;
  },
}) {
  const entity = "Kč";

  const part = axiomInput(cont("úrok", input.part, entity), 1);
  const base = axiomInput(cont("vypůjčeno", input.base, entity), 2);

  const template = highlight => highlight`
    Zaplaceno na úrocích ${input.part} Kč za jeden rok.
    Půjčeno ${input.base} Kč.
    Kolik procent činí úrok?`;

  return {
    deductionTree: deduce(
      part,
      base,
      ctorPercent()
    ),
    template
  }
}