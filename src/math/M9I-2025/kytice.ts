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
  const ruzeRate = axiomInput(rate(ruzeAgent, input.cenaZaKus.ruze, entity, kusEntity), 4)
  const chryzantemaRate = axiomInput(rate(chryzatemaAgent, input.cenaZaKus.chryzantema, entity, kusEntity), 5)
  const staticeRate = axiomInput(rate(staticAgent, input.cenaZaKus.statice, entity, kusEntity), 6)

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
  const empty = ' ';

  return {
    template: highlight => highlight`Kytice byla svázána ze tří druhů květin: růží, chryzantém a static.

Růží a chryzantém dohromady je v kytici o ${empty} 2 více než chryzantém a static dohromady. Počet růží ku počtu static je v poměru ${empty} 5 : 4, počet static ku počtu chryzantémm v poměru ${empty} 2 : 3.

V tabulce je u každého druhu květin uvedena cena za jeden kus. Cena celé kytice se získá jako součet cen jednotlivých květin, z nichž byla kytice svázána.

Druh květiny	Cena za kus	Počet kusů v kytici
Růže ${input.cenaZaKus.ruze} korun	
Chryzantéma	${input.cenaZaKus.chryzantema} korun	
Statice	${input.cenaZaKus.statice} korun	

Kolik korun bude stát celá kytice?`,
    deductionTree: deduce(
      deduce(
        deduce(ruze, ruzeRate),
        deduce(last(statice), staticeRate),
        deduce(chryzantem, chryzantemaRate),
        sum(kyticeAgent)
      ),
      ctorOption("D", 1_300)
    )
  }
}
