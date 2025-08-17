import { sum, ctorOption, quota, ratio, contLength, contArea, EmptyUnit, primeFactors } from "../../components/math";
import { axiomInput, connectTo, deduce, deduceLbl, last, lastQuantity, to } from "../../utils/deduce-utils";
import { volume } from "../shapes/rectangle";


interface InputParameters {
  baseSurfaceArea: number
  quota: number
}
export function domecek({ input }: { input: InputParameters }) {

  const dumLabel = "domeček"

  const area = axiomInput(contArea(`plocha ${dumLabel}`, input.baseSurfaceArea, EmptyUnit), 1);
  const pasmo = axiomInput(quota(`plocha ${dumLabel}`, "čtverec", 4), 2);

  const ctverec = deduce(
    area,
    pasmo
  )

  const strana = to(
    ctverec,
    primeFactors([lastQuantity(ctverec)]),
    contLength("šířka", 2)
  );

  const rectangleVolume = connectTo(volume({ width: last(strana), height: contLength("výška", 2), length: contLength("délka", 8) }, { volumeLabel: "objem přízemí" }), strana);
  const deductionTree = deduce(
    deduce(
      rectangleVolume,
      deduce({ ...last(rectangleVolume), ...deduceLbl(3) }, ratio("objem přízemí", "objem střecha", 1 / 2)),
      sum("objem domeček")
    ),
    ctorOption("B", 48)
  )



  return { deductionTree }
}
