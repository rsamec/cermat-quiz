import { cont, inferenceRule, rate, sum } from "../../components/math.js";
import { axiomInput, deduce, deduceLbl} from "../../utils/deduce-utils.js";
import type { DeduceTemplate } from "../../utils/deduce-utils.js";

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

  const kapitan = axiomInput(cont(agent, input.kapitan, kapitanLabel), 1);
  const porucik = axiomInput(cont(agent, input.porucik, porucikLabel), 2);
  const cetarPerPorucik = axiomInput(rate(agent, input.cetarPerPorucik, cetarLabel, porucikLabel), 3);
  const vojinPerCetar = axiomInput(rate(agent, input.vojinPerCetar, vojinLabel, cetarLabel), 4);

  const dd1 = inferenceRule(porucik, cetarPerPorucik) as any;

  const vydaneRozkazy = sum("vydané rozkazy", [kapitanLabel, porucikLabel, cetarLabel, vojinLabel], entity, entity);
  const dostaneRozkazy = sum("přijaté rozkazy", [porucikLabel, cetarLabel, vojinLabel], entity, entity);


  const dTree1 = deduce(
    porucik,
    { ...dd1, ...deduceLbl(1) },
    deduce(
      deduce(
        porucik,
        cetarPerPorucik,
      ),
      vojinPerCetar,
    ),
    dostaneRozkazy
  )


  const template1 = (html) => html`<br/><strong>Kolik osob v rotě dostalo rozkaz k nástupu?</strong>`;

  const template = (highlight: DeduceTemplate) =>
    highlight`V rotě je ${input.kapitan} kapitán a má pod sebou ${input.porucik} poručíky.Každý poručík má pod sebou ${input.cetarPerPorucik} své četaře
a každý četař má pod sebou ${input.vojinPerCetar} svých vojínů. (Další osoby v rotě nejsou.)
Kapitán se rozhodl svolat celou rotu k nástupu.Rozkaz k nástupu se předával tak, že
kapitán vydal rozkaz všem poručíkům, z nichž každý vydal tento rozkaz svým četařům
a každý četař jej vydal svým vojínům.Poté celá rota nastoupila.
  ${template1}`



  return { deductionTree: dTree1, template: template }
}