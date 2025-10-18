
import { cont, ctorPercent } from "../../components/math.js";
import { axiomInput, deduce } from "../../utils/deduce-utils.js";

export function example({ input }: {
  input: {
    part: number;
    percentage: number;
  }
}) {
  const agentPercentPart = "úrok";
  const entity = "Kč";
  const entityPercent = "%"

  const percentage = axiomInput(cont(agentPercentPart, input.percentage, entityPercent), 2);
  const part = axiomInput(cont(agentPercentPart, input.part, entity), 1);

  const celek = cont("vypůjčeno", 100, percentage.entity);

  const template = highlight => highlight`
    Zaplaceno na úrocích ${input.part} Kč za jeden rok.
    Úrok ${input.percentage} % na jeden rok.
    Kolik bylo půjčeno před rokem v Kč?`;

  return {
    deductionTree: deduce(
      deduce(
        percentage,
        celek,
        ctorPercent()
      ),
      part
    ),
    template
  }
}