import { ctor, ctorOption, sum, ratio, ctorUnit, compRelativePercent, compRelative, contAngle, cont, ctorDifference, ctorLinearEquation, nthPart, compRatio, proportion, percent, ratios, ctorComparePercent, rate, contLength, dimensionEntity, ctorRatios, ctorRate, ctorBooleanOption, evalFormulaAsCont, formulaRegistry, productCombine, contVolume, compAngle, ctorPercent, gcd, quaterProduct, contArea, product, comp } from "../../components/math";
import { createLazyMap, deduce, last, toRate } from "../../utils/deduce-utils";

export default createLazyMap({
    1: () => stupne(),
    2: () => papir(),
    3.1: () => cesta().rozdil,
    3.2: () => cesta().doba,
    4.1: () => obdelnik().delka,
    4.2: () => obdelnik().milimetry,
    5: () => miska(),
    6: () => taborSporty(),
    7: () => stanekRuzi(),

})
function stupne() {
    return {
        deductionTree: deduce(
            contAngle("část", 18, "arcmin"),
            deduce(
                contAngle("celek", 10),
                ctorUnit("arcmin")
            ),
            ctorPercent()
        )
    }
}

function papir() {
    const dim = dimensionEntity();
    return {
        deductionTree: deduce(
            deduce(
                contLength("šířka", 80),
                contLength("délka", 208),
                gcd("největší společný násobek", ...dim.lengths),
            ),
            evalFormulaAsCont(formulaRegistry.circumReference.square, x => x.o, "čtverec", dim.length)
        )
    }
}

function cesta() {
    const dim = dimensionEntity("m");
    const max = contLength("Max", 200, "m");
    const igor = deduce(
        deduce(
            max,
            ...quaterProduct("poloměr")
        ),
        evalFormulaAsCont(formulaRegistry.circumReference.circle, x => x.o, "Igor", dim.length)
    )
    return {
        rozdil: {
            deductionTree: deduce(                
                igor,
                max,
            )
        },
        doba: {
            deductionTree: deduce(
                deduce(
                    last(igor),
                    rate("Igor", 120, dim.length, { entity: "čas", unit: "min" })
                ),
                ctorUnit("s")
            )
        }
    }

}
function obdelnik() {
    const dim = dimensionEntity();
    const stranaCtverce = deduce(
        contArea("čtverec", 81),
        evalFormulaAsCont(formulaRegistry.surfaceArea.square, x => x.a, "čtverec", dim.length)
    )

    const delka = deduce(
        stranaCtverce,
        cont("obdélník", 6, "čtverec"),
        product("obdélník, délka", [], dim.length)
    )
    const sirka = deduce(
        last(stranaCtverce),
        cont("obdélník", 2, "čtverec"),
        product("obdélník, šířka", [], dim.length)
    )

    return {
        delka: {
            deductionTree: delka,
        },
        milimetry: {
            deductionTree: deduce(
                deduce(
                    last(stranaCtverce),
                    evalFormulaAsCont(formulaRegistry.circumReference.square, x => x.o, "čtverec", dim.length)
                ),
                deduce(
                    last(delka),
                    last(delka),
                    sirka,
                    last(sirka),
                    sum("obdélník")
                ),
                ctorRatios("poměr", { useBase: true })
            )
        }
    }
}

function miska() {
    const entity = "kulička"
    const rozdil = "rozdíl"

    const bila = deduce(
        cont(rozdil, 12, entity),
        comp("černé", "bílé", 2, entity),
        ctor('comp-part-eq')
    );
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    bila,
                    ratio("celkem", "bílé", 1 / 3)
                ),
                last(bila),
                ctorDifference("zbylo bílé")
            ),
            ctorOption("B", 10)
        )
    }
}

function taborSporty() {
    const entity = "dětí";
    const celkem = cont("celkem", 180, entity);
    const fotbal = deduce(
        celkem,
        ratio("celkem", "fotbal", 1 / 3)
    );
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    celkem,
                    fotbal,
                    ctorDifference("jen tenis")
                ),
                deduce(
                    last(fotbal),
                    ratio("fotbal", "oba sporty", 1 / 2)
                ),
                sum("tenis")
            ),
            ctorOption("D", 150)
        )
    };
}

function stanekRuzi() {
    const entity = "růže"
    const celkem = cont("celkem", 540, entity);
    const bile = deduce(
        cont("celkem", 540, entity),
        compRelativePercent("modré", "bílé", -20)
    );
    return {
        deductionTree: deduce(
            deduce(
                bile,
                deduce(
                    celkem,
                    last(bile),
                    ctorDifference("modré")
                )
            ),
            ctorOption("A", 60)
        )
    }
}
