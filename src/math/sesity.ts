import { cont, ratios, nthPart, ctor, compRatio, sum, ctorRatiosInvert } from "../components/math";
import { deduce } from "../utils/deduce-utils";

export const sesity = () => {
  const ctvereckovaniSesitLabel = "čtverečkovaný sešit";
  const linkovanySesitLabel = "linkovaný sešit";
  const entity = "sešit";
  const entityPrice = "Kč";
  const pocetLabel = "počet sešitů za stejnou cenu";
  const ctvereckovanyPocet = cont(ctvereckovaniSesitLabel, 2, entity);
  const linkovanyPocet = cont(linkovanySesitLabel, 2, entity);
  const cenaSesitu = ratios(pocetLabel, [ctvereckovaniSesitLabel, linkovanySesitLabel], [2, 3]);

  return [
    {
      deductionTree: deduce(
        cont("celkem koupeno", 36, entity),
        compRatio(linkovanySesitLabel, ctvereckovaniSesitLabel, 3),
        nthPart(linkovanySesitLabel)
      )
    },
    {
      deductionTree: deduce(
        deduce(
          cont(linkovanySesitLabel, 180, entityPrice),
          deduce(
            linkovanyPocet,
            deduce(
              ratios(pocetLabel, [ctvereckovaniSesitLabel, linkovanySesitLabel], [2, 3]),
              ctvereckovanyPocet,
              nthPart(linkovanySesitLabel)
            ),
            sum(linkovanySesitLabel)
          ),
          ctor("rate")
        ),
        deduce(cenaSesitu,ctorRatiosInvert("cena sešitů")),
        nthPart(ctvereckovaniSesitLabel)
      )
    }]
}
