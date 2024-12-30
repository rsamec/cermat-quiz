import { html } from "htl";

import { cont, diff, inferenceRule, ratio, sum } from "../../components/math.js";
import { deduce } from "../../utils/deduce.js";
import { formatNode as format, inputLabel, deduceLabel, highlight } from "../../utils/deduce-components.js";


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

  const percent = cont(agentPercentPart, input.percentageDown, entityPercent);
  const celek = cont(agentPercentBase, 100, entityPercent);
  const dd1 = inferenceRule(percent, celek, { kind: 'ratio' });
  const dd1Up = ratio({ agent: "cena po slevě", entity }, { agent: "zdraženo", entity }, input.percentageNewUp / 100);

  const percentBase = cont(agentPercentBase, input.base, entity);
  const dd2 = inferenceRule(percentBase, dd1);

  const sleva = diff(agentPercentBase, "cena po slevě", dd2.kind === 'cont' && dd2.quantity, entity)
  const dd3 = inferenceRule(sleva, percentBase);

  const dd4 = inferenceRule(dd3, dd1Up);

  const soucet = sum("konečná cena", ["cena po slevě", "zdraženo"], entity, entity);
  const dd5 = inferenceRule([dd3, dd4] as any[], soucet)

  const deductionTree = deduce(
    deduce(
      deduce(
        deduce(
          deduce(
            format(percent, inputLabel(2)),
            format(celek),
            format(dd1, deduceLabel(1))
          ),
          format(percentBase, inputLabel(1)),
          format(dd2, deduceLabel(2))
        ),
        format(sleva),
        format(dd3, deduceLabel(3))
      ),
      format(dd1Up, deduceLabel(1)),
      format(dd4, deduceLabel(4))
    ),
    format(dd3, deduceLabel(3)),
    format(soucet),
    format(dd5, deduceLabel(5))
  )


  const template = html`
    ${inputLabel(1)}${highlight`Kolo v obchodě stálo ${input.base.toLocaleString("cs-CZ")} Kč.`}.
    ${inputLabel(2)}${highlight`Nejdříve bylo zlevněno o ${input.percentageDown} % z původní ceny.`}.
    ${inputLabel(3)}${highlight`Po měsíci bylo zdraženo o ${input.percentageNewUp} % z nové ceny.`}.
    .<br/>
    ${deduceLabel(6)}<strong> ${highlight`Jaká byla výsledná cena kola po zlevnění i zdražení?`}</strong>`;

  return { deductionTree, template }
}