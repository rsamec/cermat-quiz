import { cont, ctor, ctorOption, sum, counter, product, ctorDifference, contLength, dimensionEntity, contArea, ctorUnit, contVolume, evalFormulaAsCont, formulaRegistry, ctorPercent, ctorComplement, compRelative, ratio, doubleProduct, percent, contAngle, compAngle, triangleAngle, compRatio, ctorLinearEquation } from "../../components/math";
import { anglesNames, createLazyMap, deduce, deduceAs, last, toCont } from "../../utils/deduce-utils";

export default createLazyMap({
    4: () => obyvatelSporty(),
    5: () => velikostUhlu(),
    6.1: () => procenta().treti,
    6.2: () => procenta().druhy,
    6.3: () => procenta().druhyPocet,

})

function obyvatelSporty() {
    const entity = "obyvatel";
    const celkem = cont("celkem", 250, entity)
    const golf = deduce(
        celkem,
        percent("celkem", "golf", 52),
    )
    return {
        deductionTree: deduce(
            deduce(
                deduceAs("jen tenis")(
                    celkem,
                    golf,
                    ctorDifference("tenis")
                ),
                deduceAs("tenis společně s golfem")(
                    last(golf),
                    ratio("golf", "tenis", 2 / 5)
                ),
                sum("tenis")
            ),
            ctorOption("C", 172)
        )
    }
}


function velikostUhlu() {
    const pravyB = contAngle("B", 90);
    const B = contAngle("B", 30);
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    deduce(
                        B,
                        deduce(
                            pravyB,
                            compAngle("B", "CD", "alternate-interior")
                        ),
                        triangleAngle("C")),
                    compAngle("C", "A", "corresponding")
                ),
                deduce(
                    pravyB,
                    contAngle("CD", 59),
                    triangleAngle("A'")
                ),
                ctorDifference(anglesNames.alpha)
            ),
            ctorOption("B", 29)
        )
    }
}

function procenta() {
    const entity = "testy"
    const prvni = "první den"
    const druhy = "druhý den"
    const treti = "poslední den"
    const celkem = cont("celkem", 170, entity)
    const prvniDen = cont(prvni, "x", entity)
    const druhyDenCompare = compRatio(druhy, prvni, 5);

    const druhyDen = deduce(
        prvniDen,
        druhyDenCompare
    )
    const tretiDen = deduce(
        prvniDen,
        compRelative(treti, prvni, -1 / 5)
    )
    return {
        treti: {
            deductionTree: tretiDen
        },
        druhy: {
            deductionTree: druhyDen
        },
        druhyPocet: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        prvniDen,
                        last(druhyDen),
                        last(tretiDen),
                        sum("celkem")
                    ),
                    celkem,
                    ctorLinearEquation(prvni, { entity }, "x")
                ),
                druhyDenCompare,
            )

        }
    }
}