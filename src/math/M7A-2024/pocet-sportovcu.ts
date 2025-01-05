import { cont, compDiff, inferenceRule, lcd } from "../../components/math.js";
import { axiomInput, deduce, type DeduceTemplate } from "../../utils/deduce-utils.js";

interface SportovciParams {

}
export default function build({ input }: {
  input: SportovciParams,
}) {

  const entity = "sportovců";

  const dvojice = axiomInput(cont("dvojice", 2, entity), 1);
  const trojice = axiomInput(cont("trojice", 3, entity), 2);
  const ctverice = axiomInput(cont("čtveřice", 4, entity), 3);
  const petice = axiomInput(cont("pětice", 5, entity), 4);

  const lcdLabel = "nejmenší možná skupina";
  const nasobek = lcd(lcdLabel, entity);
  const dd1 = inferenceRule(dvojice, trojice, ctverice, petice, nasobek);

  const rozdil = axiomInput(compDiff("počet sportovců", lcdLabel, 1, entity), 5)
  const dd2 = inferenceRule(dd1, rozdil)

  const deductionTree =
    deduce(
      deduce(
        dvojice,
        trojice,
        ctverice,
        petice,
        nasobek
      ),
    rozdil)

  const template = (highlight: DeduceTemplate) => highlight`Počet sportovců na závodech byl více než 1 a zároveň méně než 90.
  Pořadatel chtěl sportovce seřadit do slavnostního průvodu, ale ať je rozděloval do ${'dvojic'}, ${'trojic'}, ${'čtveřic'} nebo ${'pětic'}, vždy mu ${'jeden'} sportovec zbyl.
  ${html => html`<br/><strong>Kolik sportovců se sešlo na závodech?</strong>`}`;

  return { deductionTree, template }
}