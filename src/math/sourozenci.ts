import { html } from "htl";
import type { Predicate } from "../utils/math.js";
import { cont, sum, inferenceRule } from "../utils/math.js";
import { deduce } from "../utils/deduce.js";
import { formatNode as format, inputLabel, deduceLabel, outputLabel } from "../utils/deduce-components.js";

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

  const zbyva = cont("zbývá", input.zbyvaNasporit, "Kč");
  const michalPlus = cont("Michal+", input.michalPlus, "Kč");
  const penize = sum("Michal+zbývá", [], "Kč", "Kč");

  const eva = cont("Eva", input.evaPodil, "%");
  const michal = cont("Michal", input.evaPodil, "%");
  const spolecne = sum("Eva + Michal", [], "%", "%");
  const celek = cont("celek", 100, "%")




  const dd1 = inferenceRule([eva, michal], spolecne);
  const dd2 = inferenceRule(dd1, celek, { kind: 'ratio' });
  const dd3 = inferenceRule([michalPlus, zbyva], penize);
  const dd4 = inferenceRule(dd3, dd2, { kind: 'ratioDiff' });
  const deductionTree = deduce(
    deduce(
      deduce(format(eva, inputLabel(2)), format(michal), format(spolecne, inputLabel(1)), format(dd1, deduceLabel(1))),
      format(celek),
      format(dd2, deduceLabel(2)),
    ),
    deduce(format(michalPlus, inputLabel(3)), format(zbyva, inputLabel(4)), format(penize), format(dd3, deduceLabel(3))),
    format(dd4, outputLabel(4))
  )

  const template = html`
  ${inputLabel(1)}Dva sourozenci Eva a Michal šetří společně na dárek pro rodiče.
  ${inputLabel(2)}Eva našetřila ${input.evaPodil} % potřebné částky, ${inputLabel(3)}Michal o ${input.michalPlus} korun více než Eva.
  ${inputLabel(4)}Sourozencům zbývá našetřit ${input.zbyvaNasporit} korun.<br/>
  ${outputLabel(5)} <strong> Kolik korun stojí dárek?</strong>`;

  return { deductionTree, data, template }
}