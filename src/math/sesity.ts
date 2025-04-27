import { cont, ratios, proportion, nthPart, ctor, compRatio, nthPartFactor } from "../components/math";
import { axiomInput, deduce } from "../utils/deduce-utils";

export const sesity = () => {
  const ctvereckovaniSesitLabel = "čtverečkovaný sešit";
  const linkovanySesitLabel = "linkovaný sešit";
  const entity = "sešit";
  const entityPrice = "Kč";
  const pocetLabel = "cena sešitů výjádřených počtem";
  const cenaLabel = "nákupu stejného počtu sešitů";
  const ctvereckovanyPocet = axiomInput(cont(ctvereckovaniSesitLabel, 2, entity), 1);

  return [
    {
      deductionTree: deduce(
        cont(pocetLabel, 36, entity),
        ratios(pocetLabel, [linkovanySesitLabel, ctvereckovaniSesitLabel], [3, 1]),
        nthPart(linkovanySesitLabel)
      )
    },
    {
      deductionTree: deduce(
        deduce(
          deduce(
            axiomInput(ratios(pocetLabel, [ctvereckovaniSesitLabel, linkovanySesitLabel], [2, 3]), 2),
            proportion(true, [pocetLabel, cenaLabel])
          ),
          axiomInput(cont(cenaLabel,180, entityPrice), 3),
          nthPart(ctvereckovaniSesitLabel)
        ),
        ctvereckovanyPocet,
        ctor("rate")
      )
    }]
}
