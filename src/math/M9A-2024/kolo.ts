import { cont, compDiff, inferenceRule, ratio, sum, ctor } from "../../components/math.js";
import { to, deduce, inputLbl, deduceLbl } from "../../utils/deduce-utils.js";
import type { DeduceTemplate } from "../../utils/deduce-utils.js";

interface PercentPartParams {
  base: number;
  percentageDown: number;
  percentageNewUp: number;
}
export default function build({ input }: {
  input: PercentPartParams,
}) {

  const agentPercentBase = "cena";
  const agentPercentPart = "sleva";
  const entity = "Kč";
  const entityPercent = "%"

  const percent = cont(agentPercentPart, input.percentageDown, entityPercent)
  const celek = cont(agentPercentBase, 100, entityPercent);
  const dd1 = inferenceRule(percent, celek, ctor('ratio'));
  const dd1Up = ratio({ agent: "cena po slevě", entity }, { agent: "zdraženo", entity }, input.percentageNewUp / 100)

  const percentBase = cont(agentPercentBase, input.base, entity)
  const dd2 = inferenceRule(percentBase, dd1);

  const sleva = compDiff(agentPercentBase, "cena po slevě", dd2.kind === 'cont' && dd2.quantity, entity)
  const dd3 = inferenceRule(sleva, percentBase);

  const dd4 = inferenceRule(dd3, dd1Up);

  const soucet = sum("konečná cena", ["cena po slevě", "zdraženo"], entity, entity);
  const dd5 = inferenceRule(dd3, dd4, soucet)


  const deductionTree =
    deduce(
      deduce(
        to(
          deduce(
            deduce(
              { ...percent, ...inputLbl(2) },
              celek,
              ctor('ratio'),
            ),
            { ...percentBase, ...inputLbl(1) }
          ),
          sleva,
          dd3,
        ),
        { ...dd1Up, ...inputLbl(3) },
      ),
      { ...dd3, ...deduceLbl(3) },
      soucet,
    )


  const template = (highlightLabel: DeduceTemplate) =>
    highlightLabel`Kolo v obchodě stálo ${input.base.toLocaleString("cs-CZ")} Kč.
    Nejdříve bylo zlevněno o ${input.percentageDown} % z původní ceny.
    Po měsíci bylo zdraženo o ${input.percentageNewUp} % z nové ceny.
    ${(html) => html`<br/><strong>Jaká byla výsledná cena kola po zlevnění i zdražení?</strong>`}`;

  return { deductionTree, template }
}