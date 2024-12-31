import { html } from "htl";
import type { Predicate } from "../../components/math.js";
import { cont, sum, inferenceRule, ratio } from "../../components/math.js";
import { deduce } from "../../utils/deduce.js";
import { formatNode as format, inputLabel, deduceLabel, highlight, relativeParts } from "../../utils/deduce-components.js";

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
  const zbyva = cont("zbývá", input.zbyvaNasporit, entity);
  const michalPlus = cont("Michal+", input.michalPlus, entity);
  const penize = sum("Michal+zbývá", [], entity, entity);

  const eva = cont("Eva", input.evaPodil, "%");
  const michal = cont("Michal", input.evaPodil, "%");
  const spolecne = sum("Eva + Michal", [], "%", "%");
  const celek = cont("celek", 100, "%")




  const dd1 = inferenceRule([eva, michal], spolecne);
  const dd2 = inferenceRule(dd1, celek, { kind: 'ratio' });
  const fig1 = relativeParts(dd2.kind === 'ratio' && dd2.ratio, { first: "Eva + Michal", second: "Michal+zbývá" });
  const dd3 = ratio({ agent: "dárek", entity }, {agent:'Michal+zbývá', entity}, dd2.kind === 'ratio' && 1 - dd2.ratio)
  const dd4 = inferenceRule([michalPlus, zbyva], penize);  
  const dd5 = inferenceRule(dd3, dd4);
  const deductionTree = deduce(
    deduce(
      deduce(
        deduce(format(eva, inputLabel(2)), format(michal), format(spolecne, inputLabel(1)), format(dd1, deduceLabel(1))),
        format(celek),
        format(dd2, deduceLabel(2)),
      ),
      fig1,
      format(dd3,deduceLabel(3))
    ),
    deduce(format(michalPlus, inputLabel(3)), format(zbyva, inputLabel(4)), format(penize), format(dd4, deduceLabel(4))),
    format(dd5, deduceLabel(5))
  )

  const template = html`
  ${inputLabel(1)}${highlight`Dva sourozenci Eva a Michal šetří společně na dárek pro rodiče.`}
  ${inputLabel(2)}${highlight`Eva našetřila ${input.evaPodil} % potřebné částky, ${inputLabel(3)}Michal o ${input.michalPlus} korun více než Eva.`}
  ${inputLabel(4)}${highlight`Sourozencům zbývá našetřit ${input.zbyvaNasporit} korun.`}<br/>
  ${deduceLabel(5)} <strong> Kolik korun stojí dárek?</strong>`;

  return { deductionTree, data, template }
}