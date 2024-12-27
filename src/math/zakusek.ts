import { html } from "htl";
import type { Container } from "../utils/math.js";
import { cont, inferenceRule, ratio, comp, sum } from "../utils/math.js";
import { deduce } from "../utils/deduce.js";
import { relativeParts, relativePartsDiff, formatNode as format, inputLabel, deduceLabel, highlight } from "../utils/deduce-components.js";

interface ZakuseParams {
  cena: number;
}
export default function build({ input }: {
  input: ZakuseParams
}) {


  const piece1 = '1.zákusek';
  const piece2 = '2.zákusek';
  const piece3 = '3.zákusek';
  const entity = "Kč";

  const whole = 'celek';


  const totalPrice = 'celkem';
  const partTotalPrice = "1.zák.+2.zák";


  const p1p2 = comp(piece2, piece1, -1 / 4, "")
  const p1 = cont(piece1, input.cena, entity)
  const p2Ratio = ratio({ agent: piece1, entity }, { agent: piece2, entity }, 3 / 4);
  const p3Ratio = ratio({ agent: totalPrice, entity }, { agent: partTotalPrice, entity }, 2 / 3);
  const oneThird = ratio({ agent: totalPrice, entity }, { agent: piece3, entity }, 1 / 3)

  const soucet = sum(partTotalPrice, [], "Kč", "Kč");
  //const p2 = comp(piece2, piece1, , entity)


  const dd1 = inferenceRule(p1, p2Ratio, { kind: 'ratio' }) as Container;
  const dd2 = inferenceRule([p1, dd1], soucet);
  const dd3 = inferenceRule(dd2, p3Ratio);
  const dd4 = inferenceRule(dd3, oneThird);

  const fig1 = relativePartsDiff(-1 / 4, { first: piece2, second: piece1 });
  const fig2 = relativeParts(1 / 3, { first: piece3, second: partTotalPrice });

  const deductionTree =
    deduce(
      deduce(
        deduce(
          format(p1, inputLabel(1)),
          deduce(
            format(p1, inputLabel(1)),
            deduce(
              format(p1p2, inputLabel(2)),
              fig1,
              format(p2Ratio, deduceLabel(1)),
            ),
            format(dd1, deduceLabel(2))
          ),
          format(soucet),
          format(dd2, deduceLabel(3)),
        ),
        deduce(
          format(oneThird, inputLabel(3)),
          fig2,
          format(p3Ratio, deduceLabel(4)),
        ),
        format(dd3, deduceLabel(5))
      ),
      format(oneThird, inputLabel(3)),
      format(dd4, deduceLabel(6))
    )


  const zak2 = dd2.kind === "cont" ? dd2.quantity - input.cena : 0;
  const celkemVse = dd3.kind === "cont" ? dd3.quantity : 0;

  const data = [
    { agent: "č.1", value: input.cena },
    { agent: "č.2", value: zak2 },
    { agent: "č.3", value: celkemVse - (input.cena + zak2) }
  ];

  const template = html`
  Maminka koupila v cukrárně tři různé zákusky.
  ${inputLabel(1)}${highlight`První zákusek stál ${input.cena} korun.`}
  ${inputLabel(2)}${highlight`Druhý zákusek byl o čtvrtinu levnější než první.`}
  ${inputLabel(3)}${highlight`Cena třetího zákusku byla třetinou celkové ceny všech tří zákusků.`}<br/>
  ${deduceLabel(6)}<strong>O kolik korun byl třetí zákusek dražší než druhý?</strong>`;

  return { deductionTree, data, template, fig1, }
}