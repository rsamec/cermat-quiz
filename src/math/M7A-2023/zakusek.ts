
import { cont, inferenceRule, ratio, compRelative, ctorComplement, ctorExpressionOption, ctorAccumulate } from "../../components/math";
import { axiomInput, deduce, deduceLbl } from "../../utils/deduce-utils";

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



  const totalPrice = 'celkem';
  const partTotalPrice = "1.zák.+2.zák";


  const p1p2 = axiomInput(compRelative(piece2, piece1, -1 / 4), 2);
  const p1 = axiomInput(cont(piece1, input.cena, entity), 1)
  const p2Ratio = ratio(piece1, piece2, 3 / 4);
  const p3Ratio = ratio(totalPrice, partTotalPrice, 2 / 3);
  const oneThird = axiomInput(ratio(totalPrice, piece3, 1 / 3), 3);

  const soucet = ctorAccumulate(partTotalPrice);



  const dd1 = inferenceRule(p1, p2Ratio)
  const dd2 = inferenceRule(p1, dd1, soucet);
  const dd3 = inferenceRule(dd2, p3Ratio);


  const deductionTree = deduce(
    deduce(
      { ...dd1, ...deduceLbl(2) },
      deduce(
        deduce(
          deduce(
            p1,
            deduce(
              p1,
              p1p2,
            ),
            soucet
          ),
          deduce(
            oneThird,
            ctorComplement(partTotalPrice),
          )
        ),
        oneThird)
    ),
    ctorExpressionOption("A", "x < 12")
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