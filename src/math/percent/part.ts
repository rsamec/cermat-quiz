import { cont, ctorPercent } from "../../components/math.js";
import { axiomInput, deduce } from "../../utils/deduce-utils.js";


export function example({ input }: {
  input: {
    base: number;
    percentage: number;
  },
}) {

  const percentage = axiomInput(cont("úrok", input.percentage, "%"), 2);
  const base = axiomInput(cont("vypůjčeno", input.base, "Kč"), 1);
  const celek = cont(base.agent, 100, percentage.entity);

  const deductionTree = deduce(
    deduce(
      percentage,
      celek,
      ctorPercent()
    ),
    base,
  )

  const template = html => html`
    Vypůjčeno ${input.base} Kč na jeden rok.
    Úrok ${input.percentage} % na jeden rok.
    Kolik je úrok v Kč?`;

  return { deductionTree, template }
}