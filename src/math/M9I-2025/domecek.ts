import { sum, ctorOption, quota, ratio, contLength, contArea, EmptyUnit, cuboidVolume, dimensionEntity, evalFormulaAsCont, formulaRegistry } from "../../components/math";
import { deduce, last, toCont } from "../../utils/deduce-utils";


export function domecek() {
  const dim = dimensionEntity();

  const dumLabel = "domeček"

  const area = contArea(`plocha ${dumLabel}`, 16, EmptyUnit);
  const pasmo = quota(`plocha ${dumLabel}`, "čtverec", 4);

  const ctverec = toCont(
    deduce(
      area,
      pasmo
    ), { agent: 'čtverec', entity: { entity: dim.area.entity, unit: EmptyUnit } })

  const rectangleVolume = deduce(
    deduce(
      ctverec,
      evalFormulaAsCont(formulaRegistry.surfaceArea.square, x => x.a, "šířka", { entity: dim.length.entity, unit: EmptyUnit })
    ),
    contLength("délka", 8),
    contLength("výška", 2),
    cuboidVolume("objem přízemí")
  );
  const deductionTree = deduce(
    deduce(
      rectangleVolume,
      deduce(
        last(rectangleVolume),
        ratio("objem přízemí", "objem střecha", 1 / 2)
      ),
      sum("objem domeček")
    ),
    ctorOption("B", 48)
  )



  return { deductionTree }
}
