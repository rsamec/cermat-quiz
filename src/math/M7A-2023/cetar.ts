import { cont, rate, ctorAccumulate } from "../../components/math";
import { axiomInput, deduce, last } from "../../utils/deduce-utils";
import type { DeduceTemplate } from "../../utils/deduce-utils";

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
  const entity = "rozkaz";

  const kapitan = axiomInput(cont(agent, input.kapitan, kapitanLabel), 1);
  const porucik = axiomInput(cont(agent, input.porucik, porucikLabel), 2);
  const cetarPerPorucik = axiomInput(rate(agent, input.cetarPerPorucik, cetarLabel, porucikLabel), 3);
  const vojinPerCetar = axiomInput(rate(agent, input.vojinPerCetar, vojinLabel, cetarLabel), 4);



  const pocetCetaru = deduce(
    porucik,
    cetarPerPorucik,
  )
  const pocetVojinu = deduce(
    pocetCetaru,
    vojinPerCetar,
  )
  const dTree2 = deduce(
    kapitan,
    porucik,
    last(pocetCetaru),
    ctorAccumulate("vydané rozkazy", {entity}),
  )
  const dTree3 = deduce(
    porucik,
    last(pocetCetaru),
    last(pocetVojinu),
    ctorAccumulate("přijaté rozkazy",{entity})
  )


  const template1 = (html) => html`<br/><strong>Kolik osob v rotě dostalo rozkaz k nástupu?</strong>`;

  const template = (highlight: DeduceTemplate) =>
    highlight`V rotě je ${input.kapitan} kapitán a má pod sebou ${input.porucik} poručíky.Každý poručík má pod sebou ${input.cetarPerPorucik} své četaře
a každý četař má pod sebou ${input.vojinPerCetar} svých vojínů. (Další osoby v rotě nejsou.)
Kapitán se rozhodl svolat celou rotu k nástupu.Rozkaz k nástupu se předával tak, že
kapitán vydal rozkaz všem poručíkům, z nichž každý vydal tento rozkaz svým četařům
a každý četař jej vydal svým vojínům.Poté celá rota nastoupila.
  ${template1}`



  return [{
    deductionTree: pocetVojinu
  },
  {
    deductionTree: dTree2,
  },
  {
    deductionTree: dTree3,
    template: template
  }]
}