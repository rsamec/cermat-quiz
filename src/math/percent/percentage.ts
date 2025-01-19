
import { cont, ctor, type Container } from "../../components/math.js";
import { axiomInput, deduce } from "../../utils/deduce-utils.js";

export function percentage({ base, part }: { base: Container, part: Container },
  labels: { entityPercent?: string } = {}) {

  const { entityPercent } = { ...{ entityPercent: "%" }, ...labels }

  const celek = cont(base.agent, 100, entityPercent);
  return deduce(
    deduce(
      part,
      base,
      ctor('ratio')
    ),
    celek,
  )
}
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

  return { deductionTree: percentage({ base, part }), template }
}