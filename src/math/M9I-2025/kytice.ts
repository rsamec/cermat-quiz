import { comp, compDiff, compRatio, compRelative, cont, ctor, gcd, nthPart, product, rate, ratios, sum } from "../../components/math.js";
import { axiomInput, deduce, deduceLbl, last, to } from "../../utils/deduce-utils.js";


interface InputParameters {

}
export function kytice({ input }: { input: InputParameters }) {
  const kyticeLabel = "kytice";
  const chryzatemaLabel = "chryzantéma";
  const ruzeLabel = "růže";
  const staticLabel = "statice";
  const kusEntity = "kus";
  const entity = "cena";

  const rozdilRuze = axiomInput(comp(ruzeLabel, staticLabel, 2, kusEntity), 1);
  const RtoS = axiomInput(compRatio(ruzeLabel, staticLabel, 5 / 4), 2);
  const CHxS = axiomInput(ratios(kyticeLabel, [chryzatemaLabel, staticLabel], [3, 2]), 3);

  const ruzeRate = axiomInput(rate(chryzatemaLabel, 54, entity, kusEntity), 4)
  const chryzantemaRate = axiomInput(rate(chryzatemaLabel, 40, entity, kusEntity), 5)
  const staticeRate = axiomInput(rate(chryzatemaLabel, 35, entity, kusEntity), 6)

  const statice = deduce(
    rozdilRuze,
    RtoS
  )
  const chryzantem = deduce(
    last(statice),
    CHxS,
    nthPart(chryzatemaLabel)
  )
  const ruze = deduce(
    statice,
    rozdilRuze
  )

  const deductionTree = deduce(

    deduce(ruze, ruzeRate),
    deduce(last(statice), staticeRate),
    deduce(chryzantem, chryzantemaRate),
    sum(kyticeLabel, [ruzeLabel, chryzatemaLabel,staticLabel], entity,entity)
  )


  return { deductionTree }
}
