import { cont, sum, ctor, ctorComplement } from "../../components/math";
import { axiomInput, deduce } from "../../utils/deduce-utils";

interface SourozenciParams {
  evaPodil;
  zbyvaNasporit: number;
  michalPlus: number;
}
export default function build({ input }: {
  input: SourozenciParams,
}) {
  const percentValue = (input.zbyvaNasporit + input.michalPlus) / (100 - (input.evaPodil * 2));
  const data = [
    { agent: "Eva", value: input.evaPodil * percentValue },
    { agent: "Michal", value: input.evaPodil * percentValue },
    { agent: "Michal", opacity: 0.5, value: input.michalPlus },
    { agent: "zbyva", value: input.zbyvaNasporit }];

  const entity = "Kč";
  const zbyva = axiomInput(cont("zbývá", input.zbyvaNasporit, entity), 4);
  const michalPlus = axiomInput(cont("Michal+", input.michalPlus, entity), 3);
  const penize = sum("Michal+zbývá", [], entity, entity);

  const eva = axiomInput(cont("Eva", input.evaPodil, "%"), 2)
  const michal = cont("Michal", input.evaPodil, "%");
  const spolecne = axiomInput(sum("Eva + Michal", [], "%", "%"), 1);
  const celek = cont("celek", 100, "%")


  const deductionTree = deduce(
    deduce(
      deduce(
        deduce(eva, michal, spolecne),
        celek,
        ctor('ratio')
      ),
      ctorComplement("Michal+zbývá"),
    ),
    deduce(michalPlus, zbyva, penize),
  )

  const template = highlight => highlight`
  Dva sourozenci Eva a Michal šetří ${'společně'} na dárek pro rodiče.
  Eva našetřila ${input.evaPodil} % potřebné částky, Michal o ${input.michalPlus} korun více než Eva.
  Sourozencům zbývá našetřit ${input.zbyvaNasporit} korun.
  ${html => html`<br/><strong> Kolik korun stojí dárek?</strong>`}`;

  return { deductionTree, data, template }
}