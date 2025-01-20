
import { cont, ratio, inferenceRule } from "../components/math.js";
import { axiomInput, deduce } from "../utils/deduce-utils.js";

interface MlekoParams {
  vekRozdil: number;
}
export default function build({ input }: {
  input: MlekoParams,
}) {

  const adamLabel = "Adam";
  const petrLabel = "Petr";
  const entity = "věk";
  const vekRozdilLabel = "rozdíl";

  //const vekRozdil = comp(adamLabel, petrLabel, input.vekRozdil, entity)
  const vekRozdil = cont(vekRozdilLabel, input.vekRozdil, entity)
  //const vekRozdilTimes = comp(adamLabel, petrLabel, 2)

  //const fig1 = relativeParts(2 / 3, { first: adamLabel, second: petrLabel })
  const diffRatio = ratio("vekDohromady", petrLabel, 1 / 3)

  const dd2 = inferenceRule(vekRozdil, diffRatio);
  // const dd3 = inferenceRule(dd2, b);
  // const dd4 = inferenceRule(dd3, milk);

  const deductionTree = deduce(
    axiomInput(vekRozdil,1),
    deduce(vekRozdil,diffRatio)
  )


  const template = highlight => highlight`Adam je o ${input.vekRozdil} let starší než Petr.
  Za 4 roky bude Adam 2x starší než Petr.
  Kolik je Petrovi let?</strong>`;

  const data = [
    { agent: "Petr", value: input.vekRozdil - 4 },
    { agent: "Adam", value: (((dd2.kind === "cont" && dd2.quantity) ?? 0) - input.vekRozdil) - 4 },

  ];

  return { deductionTree, data, template }
}