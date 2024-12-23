import { html } from "htl";
import { cont, inferenceRule, ratio, comp } from "../utils/math.js";
import { deduce, } from "../utils/deduce.js";
import { relativeParts, formatNode as format, inputLabel, deduceLabel, outputLabel, highlight } from "../utils/deduce-components.js";

interface MlekoParams {
  vekRozdil: number;
}
export default function build({ input }: {
  input: MlekoParams,
}) {

  const adamLabel = "Adam";
  const petrLabel = "Petr";
  const entity = "věk";
  const vekRozdilLabel ="rozdíl";

  //const vekRozdil = comp(adamLabel, petrLabel, input.vekRozdil, entity)
  const vekRozdil = cont(vekRozdilLabel, input.vekRozdil, entity)
  //const vekRozdilTimes = comp(adamLabel, petrLabel, 2)

  const fig1 = relativeParts(2/3, { first: adamLabel, second: petrLabel })
  const diffRatio = ratio("vekDohromady", petrLabel, 1 / 3)

  const dd2 = inferenceRule(vekRozdil, diffRatio);
  // const dd3 = inferenceRule(dd2, b);
  // const dd4 = inferenceRule(dd3, milk);

  const deductionTree = deduce(
    deduce(
      format(vekRozdil, inputLabel(1)),
      deduce(format(fig1), format(diffRatio, deduceLabel(1))),
      format(dd2, deduceLabel(2))),
  )


  const template = html`
  ${inputLabel(1)}${highlight`Adam je o ${input.vekRozdil} let starší než Petr.`}
  ${inputLabel(2)}${highlight`Za 4 roky bude Adam 2x starší než Petr.`}.<br />
  ${outputLabel(3)}<strong> Kolik je Petrovi let?</strong>`;

  const data = [
    { agent: "Petr", value: input.vekRozdil - 4},
    { agent: "Adam", value: (((dd2.kind === "cont" && dd2.quantity) ?? 0) - input.vekRozdil) - 4},
    
  ];

  return { deductionTree, data, template }
}