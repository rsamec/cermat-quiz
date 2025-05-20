import { comp, compRatio, ctorOption, nthPart, rate, ratios, sum } from "../../components/math";
import { axiomInput, deduce, last } from "../../utils/deduce-utils";

export function kytice({ input }: { input: { cenaZaKus: { ruze: number, chryzantema: number, statice: number } } }) {
  //agent names and entities
  const kyticeAgent = "kytice";
  const chryzatemaAgent = "chryzantéma";
  const ruzeAgent = "růže";
  const staticAgent = "statice";

  const kusEntity = "kus";
  const entity = "cena";

  //axioms
  const rozdilRuze = axiomInput(comp(ruzeAgent, staticAgent, 2, kusEntity), 1);
  const RtoS = axiomInput(compRatio(ruzeAgent, staticAgent, 5 / 4), 2);
  const CHxS = axiomInput(ratios(kyticeAgent, [chryzatemaAgent, staticAgent], [3, 2]), 3);
  const ruzeRate = axiomInput(rate(chryzatemaAgent, input.cenaZaKus.ruze, entity, kusEntity), 4)
  const chryzantemaRate = axiomInput(rate(chryzatemaAgent, input.cenaZaKus.chryzantema, entity, kusEntity), 5)
  const staticeRate = axiomInput(rate(chryzatemaAgent, input.cenaZaKus.statice, entity, kusEntity), 6)

  //deduction
  const statice = deduce(
    rozdilRuze,
    RtoS
  )
  const chryzantem = deduce(
    last(statice),
    CHxS,
    nthPart(chryzatemaAgent)
  )
  const ruze = deduce(
    statice,
    rozdilRuze
  )

  return {
    audio: true,
    deductionTree: deduce(
      deduce(
        deduce(ruze, ruzeRate),
        deduce(last(statice), staticeRate),
        deduce(chryzantem, chryzantemaRate),
        sum(kyticeAgent, [ruzeAgent, chryzatemaAgent, staticAgent], entity, entity)
      ),
      ctorOption("D", 1_300)
    )
  }
}
