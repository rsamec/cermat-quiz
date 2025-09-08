import { commonSense, compRatio, cont, ctor, ctorDifference, rate, sum, ctorSlide, compRelative, compRelativePercent, triangularNumbersPattern, nthPart, comp, ratios, counter, ctorRatios, nthPartFactor, ctorOption, ctorBooleanOption, ctorExpressionOption, contLength, halfProduct, doubleProduct, dimensionEntity, productVolume, pythagoras, productArea, double, half, product } from "../../components/math";
import { createLazyMap, deduce, deduceAs, last, lastQuantity, to } from "../../utils/deduce-utils";
import pocetObyvatel from "./pocet-obyvatel";
import sourozenci from "./sourozenci";


export default createLazyMap({
     1: () => pocetObyvatel({ input: { celkem: 86_200, jihlavaPlus: 16_000 } }),
    12: () => sourozenci({ input: { evaPodil: 40, michalPlus: 24, zbyvaNasporit: 72 } }),

})

function zavazi() {
    const delkaL = "délka"
    const sirkaL = "šířka"

    const delka = contLength(delkaL, 8);
    const sirka = contLength(sirkaL, 6);
    //const vyska = contLength("výška", 10);
    return {
        deductionTree: deduce(
            delka,
            sirka,
            deduce(
                deduce(
                    delka,
                    sirka,
                    pythagoras("odvěsna", [delkaL, sirkaL]),
                ),
                ...halfProduct("poloměr")
            ),
            sum("celkem")
        )
    }
}
