import { html } from "htl";

import { cont, compDiff, inferenceRule, rate, ratio, sum } from "../../components/math.js";
import { deduce } from "../../utils/deduce.js";
import { formatNode as format, inputLabel, deduceLabel, highlightLabel } from "../../utils/deduce-components.js";


interface PercentPartParams {
  kapitan: number;
  porucik: number;
  cetarPerPorucik: number;
  vojinPerCetar: number;
}
export default function build({ input }: {
  input: PercentPartParams,
}) {

  const agent = "rota";
  const kapitanLabel = "kapitán";
  const porucikLabel = "poručík";
  const cetarLabel = "četař";
  const vojinLabel = "vojín";
  const entity = "osob";


  const kapitan = cont(agent, input.kapitan, kapitanLabel);
  const porucik = cont(agent, input.porucik, porucikLabel);
  const cetarPerPorucik = rate(agent, input.cetarPerPorucik, cetarLabel, porucikLabel);
  const vojinPerCetar = rate(agent, input.vojinPerCetar, vojinLabel, cetarLabel);

  const dd1 = inferenceRule(porucik, cetarPerPorucik) as any;
  const dd2 = inferenceRule(dd1, vojinPerCetar) as any;

  const vydaneRozkazy = sum("vydané rozkazy", [kapitanLabel, porucikLabel, cetarLabel, vojinLabel], entity, entity);
  const dostaneRozkazy = sum("přijaté rozkazy", [porucikLabel, cetarLabel, vojinLabel], entity, entity);
  const dd3 = inferenceRule([porucik, dd1, dd2], dostaneRozkazy)


  const dTree1 = deduce(
    format(porucik, inputLabel(2)),
    deduce(
      deduce(
        format(porucik, inputLabel(2)),
        format(cetarPerPorucik, inputLabel(3)),
        format(dd1, deduceLabel(1))
      ),
      format(vojinPerCetar, inputLabel(4)),
      format(dd2, deduceLabel(2))
    ),
    format(dd1, deduceLabel(1)),
    format(dd3, deduceLabel(3))
  )


  const template = html`
  ${highlightLabel()`V rotě je ${input.kapitan} kapitán a má pod sebou ${input.porucik} poručíky. Každý poručík má pod sebou ${input.cetarPerPorucik} své četaře
a každý četař má pod sebou ${input.vojinPerCetar} svých vojínů. (Další osoby v rotě nejsou.)
Kapitán se rozhodl svolat celou rotu k nástupu. Rozkaz k nástupu se předával tak, že
kapitán vydal rozkaz všem poručíkům, z nichž každý vydal tento rozkaz svým četařům
a každý četař jej vydal svým vojínům. Poté celá rota nastoupila.`}`

  const template1 = html`${template}<br/>
    ${deduceLabel(3)}<strong>Kolik osob v rotě dostalo rozkaz k nástupu?</strong>`;

  return { deductionTree: dTree1, template: template1 }
}