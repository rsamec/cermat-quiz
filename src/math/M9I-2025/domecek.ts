import { commonSense, cont, ctorOption, primeFactorization, quota, ratio, combine } from "../../components/math";
import { axiomInput, connectTo, deduce, deduceLbl, last, lastQuantity, to } from "../../utils/deduce-utils";
import { volume } from "../shapes/rectangle";


interface InputParameters {
  baseSurfaceArea: number
  quota: number
}
export function domecek({ input }: { input: InputParameters }) {
  const entity = "cm";
  const dumLabel = "domeček"
  const entity2d = "čtverečků"
  const entity3d = "krychliček"

  const area = axiomInput(cont(`plocha ${dumLabel}`, input.baseSurfaceArea, entity2d), 1);
  const pasmo = axiomInput(quota(`plocha ${dumLabel}`, "čtverec", 4), 2);

  const ctverec = deduce(
    area,
    pasmo
  )

  const strana = to(
    ctverec,
    commonSense(`rozklad na prvočísla:${primeFactorization([lastQuantity(ctverec)]).join(",")}`),
    cont("šířka", 2, entity)
  );

  const rectangleVolume = connectTo(volume({ width: last(strana), height: cont("výška", 2, entity), length: cont("délka", 8, entity) }, { volumeLabel: "objem přízemí" }), strana);
  const deductionTree = deduce(
    deduce(
      rectangleVolume,
      deduce({ ...last(rectangleVolume), ...deduceLbl(3) }, ratio("objem přízemí", "objem střecha", 1 / 2)),
      combine("objem domeček", [], entity3d, entity)
    ),
    ctorOption("B", 48)
  )



  return { deductionTree }
}
