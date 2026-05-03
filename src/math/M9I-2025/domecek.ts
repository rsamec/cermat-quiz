import { sum, ctorOption, quota, ratio, contLength, contArea, EmptyUnit, cuboidVolume, dimensionEntity, evalFormulaAsCont, formulaRegistry, cont, ctor } from "../../components/math";
import { deduce, last, toCont } from "../../utils/deduce-utils";


export function domecek() {
  const dim = dimensionEntity();

  const dumLabel = "domeček"

  const area = contArea(`plocha ${dumLabel}`, 16);
  const pasmo = cont(`plocha ${dumLabel}`, 4, "pásma");

  const ctverec =  deduce(
      area,
      pasmo,
      ctor('rate')
  )

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
