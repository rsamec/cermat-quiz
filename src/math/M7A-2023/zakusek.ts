
import { cont, inferenceRule, ratio, comp, sum } from "../../components/math.js";
import { axiomInput, deduce, deduceLbl, to } from "../../utils/deduce-utils.js";
import { relativeParts, relativePartsDiff } from "../../utils/deduce-components.js";

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


  const p1p2 = axiomInput(comp(piece2, piece1, -1 / 4, ""), 2);
  const p1 = axiomInput(cont(piece1, input.cena, entity), 1)
  const p2Ratio = ratio({ agent: piece1, entity }, { agent: piece2, entity }, 3 / 4);
  const p3Ratio = ratio({ agent: totalPrice, entity }, { agent: partTotalPrice, entity }, 2 / 3);
  const oneThird = axiomInput(ratio({ agent: totalPrice, entity }, { agent: piece3, entity }, 1 / 3), 3);

  const soucet = sum(partTotalPrice, [], "Kč", "Kč");
  //const p2 = comp(piece2, piece1, , entity)


  const dd1 = inferenceRule(p1, p2Ratio)
  const dd2 = inferenceRule(p1, dd1, soucet);
  const dd3 = inferenceRule(dd2, p3Ratio);
  // const dd4 = inferenceRule(dd3, oneThird);

  const fig1 = relativePartsDiff(-1 / 4, { first: piece2, second: piece1 });
  const fig2 = relativeParts(1 / 3, { first: piece3, second: partTotalPrice });


  const deductionTree =
    deduce(
      { ...dd1, ...deduceLbl(2) },
      deduce(
        deduce(
          deduce(
            p1,
            deduce(
              p1,
              to(
                p1p2,
                fig1,
                p2Ratio,
              ),
            ),
            soucet
          ),
          to(
            oneThird,
            fig2,
            p3Ratio,
          ),
        ),
        oneThird)
    )


  const zak2 = dd2.kind === "cont" ? dd2.quantity - input.cena : 0;
  const celkemVse = dd3.kind === "cont" ? dd3.quantity : 0;

  const data = [
    { agent: "č.1", value: input.cena },
    { agent: "č.2", value: zak2 },
    { agent: "č.3", value: celkemVse - (input.cena + zak2) }
  ];

  const template = highlight => highlight`
  Maminka koupila v cukrárně tři různé zákusky.
  První zákusek stál ${input.cena} korun.
  Druhý zákusek byl o ${'čtvrtinu levnější než první'}.
  Cena třetího zákusku byla ${'třetinou celkové ceny všech tří zákusků'}.
  ${html => html`<br/><strong>O kolik korun byl třetí zákusek dražší než druhý?</strong>`}`;

  return { deductionTree, data, template }
}