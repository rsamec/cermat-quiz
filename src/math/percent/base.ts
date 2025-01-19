
import { cont, ctor, type Container } from "../../components/math.js";
import { axiomInput, deduce } from "../../utils/deduce-utils.js";

export function percentBase({ part, percentage }: { part: Container, percentage: Container },
  labels: { baseAgent?: string } = {}) {
  const { baseAgent } = { ...{ baseAgent: "základ" }, ...labels }
  const celek = cont(baseAgent, 100, percentage.entity);
  return deduce(
    deduce(
      percentage,
      celek,
      ctor('ratio')
    ),
    part
  )
}


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


  const template = highlight => highlight`
    Zaplaceno na úrocích ${input.part} Kč za jeden rok.
    Úrok ${input.percentage} % na jeden rok.
    Kolik bylo půjčeno před rokem v Kč?`;

  return { deductionTree: percentBase({ part, percentage },{baseAgent:'vypůjčeno'}), template }
}