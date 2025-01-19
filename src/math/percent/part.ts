import { cont, ctor, type Container } from "../../components/math.js";
import { axiomInput, deduce } from "../../utils/deduce-utils.js";


export function percentPart({ base, percentage }: { base: Container, percentage: Container }) {
  const celek = cont(base.agent, 100, percentage.entity);

  return deduce(
    deduce(
      percentage,
      celek,
      ctor('ratio')
    ),
    base,
  )
}

export function example({ input }: {
  input: {
    base: number;
    percentage: number;
  },
}) {

  const percentage = axiomInput(cont("úrok", input.percentage, "%"), 2);
  const base = axiomInput(cont("vypůjčeno", input.base, "Kč"), 1);

  const deductionTree = percentPart({ base, percentage });

  const template = html => html`
    Vypůjčeno ${input.base} Kč na jeden rok.
    Úrok ${input.percentage} % na jeden rok.
    Kolik je úrok v Kč?`;

  return { deductionTree, template }
}