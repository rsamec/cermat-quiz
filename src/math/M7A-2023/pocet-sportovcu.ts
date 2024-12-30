import { html } from "htl";

import { cont, diff, inferenceRule, lcd } from "../../components/math.js";
import { deduce } from "../../utils/deduce.js";
import { formatNode as format, inputLabel, deduceLabel, highlightLabel } from "../../utils/deduce-components.js";


interface SportovciParams {
  
}
export default function build({ input }: {
  input: SportovciParams,
}) {

  const entity = "sportovců";

  const dvojice = cont("dvojice", 2, entity);
  const trojice = cont("trojice", 3, entity);
  const ctverice = cont("čtveřice", 4, entity);
  const petice = cont("pětice", 5, entity);

  const lcdLabel = "nejmenší možná skupina";
  const nasobek = lcd(lcdLabel, entity);
  const dd1 = inferenceRule([dvojice, trojice, ctverice, petice], nasobek);

  const rozdil = diff("počet sportovců", lcdLabel, 1, entity)
  const dd2 = inferenceRule(dd1, rozdil)

  const deductionTree = deduce(
    deduce(
      format(dvojice,inputLabel(1)),
      format(trojice,inputLabel(2)),
      format(ctverice,inputLabel(3)),
      format(petice,inputLabel(4)),
      format(nasobek),
      format(dd1, deduceLabel(1))
    ),
    format(rozdil, inputLabel(5)),
    format(dd2, deduceLabel(2)),
  )


  const template = html`Počet sportovců na závodech byl více než 1 a zároveň méně než 90.
    ${highlightLabel()`Pořadatel chtěl sportovce seřadit do slavnostního průvodu, ale ať je rozděloval do ${'dvojic'}, ${'trojic'}, ${'čtveřic'} nebo ${'pětic'}, vždy mu ${'jeden'} sportovec zbyl.`}
    <br/>
    ${deduceLabel(6)}<strong>Kolik sportovců se sešlo na závodech?</strong>`;

  return { deductionTree, template }
}