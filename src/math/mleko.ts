import { html } from "htl";
import { cont, inferenceRule, ratio, comp } from "../utils/math.js";
import { deduce, } from "../utils/deduce.js";
import { relativePartsDiff, formatNode as format, inputLabel, deduceLabel, outputLabel, highlight } from "../utils/deduce-components.js";

interface MlekoParams {
  zdrazeni: number;
  rozdil: number;  
}
export default function build({ input }: {
  input: MlekoParams,
}) {

  const firstYear = "letos";
  const secondYear = "loni";

  const currencyEntity = "Kč";

  const firstToSecond = comp(firstYear, secondYear, input.zdrazeni, "")
  const second = ratio(secondYear, firstYear, 1 + input.zdrazeni);
  const fig1 = relativePartsDiff(input.zdrazeni, { first: firstYear, second: secondYear });

  const milkEntity = "litr";
  const a = cont(secondYear, 2, milkEntity);
  const b = cont(secondYear, 3, milkEntity);

  const milk = comp(firstYear, secondYear, -1 * input.rozdil, currencyEntity);

  const dd2 = inferenceRule(a, second, { kind: 'ratio' });
  const dd3 = inferenceRule(dd2, b);
  const dd4 = inferenceRule(dd3, milk);

  const deductionTree = deduce(
    deduce(
      deduce(
        deduce(format(firstToSecond, inputLabel(1)), format(fig1), format(second, deduceLabel(1))),
        format(a, inputLabel(2)),
        format(dd2, deduceLabel(2))),
      format(b, inputLabel(2)),
      format(dd3, deduceLabel(3)),
    ),
    format(milk, inputLabel(3)),
    format(dd4,outputLabel(4))
  )


  const template = html`
  ${inputLabel(1)}${highlight`Mléko zdražilo o ${input.zdrazeni} %.`}
  ${inputLabel(2)}${highlight`Za 2 litry teď zaplatíme o ${input.rozdil} méně než před zdražením za 3 litry.`}.<br />
  ${outputLabel(3)}<strong> Kolik stál 1 litr mléka před zdražením?</strong>`;

  return { deductionTree, template }
}