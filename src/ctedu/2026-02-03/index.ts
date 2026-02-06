import { ctor, ctorOption, sum, counter, contLength, dimensionEntity, evalFormulaAsCont, formulaRegistry, ratio, pythagoras, halfProduct, quaterProduct, ctorUnit, contArea, compRelativePercent, compRelative } from "../../components/math";
import { createLazyMap, deduce } from "../../utils/deduce-utils";

export default createLazyMap({
    1: () => vypocet(),
    4: () => obrazec(),
    5: () => trojuhelnik(),
    6: () => procenta(),

})

function vypocet() {
    return {
        deductionTree: deduce(
            deduce(
                counter("1. prvočíslo", 2),
                counter("2. prvočíslo", 3),
                counter("3. prvočíslo", 5),
                counter("4. prvočíslo", 7),
                counter("5. prvočíslo", 11),
                counter("6. prvočíslo", 13),
                counter("7. prvočíslo", 17),
                counter("8. prvočíslo", 19),
                sum("součet")
            ),
            ratio("součet", "sedmina", 1 / 7)
        )
    }
}
function trojuhelnik() {
    const dim = dimensionEntity();
    const zakladna = contLength("základna AB", 16)

    const ramenoBC = deduce(
        deduce(
            contArea("trojúhleník ABC", 120),
            zakladna,
            evalFormulaAsCont(formulaRegistry.surfaceArea.triangle, x => x.h, "výška", dim.length)
        ),
        deduce(
            zakladna,
            ...halfProduct("polovina základny")
        ),
        pythagoras("přepona BC", ["výška", "polovina základny"])
    );
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    deduce(
                        contArea("trojúhleník ABC", 120),
                        zakladna,
                        evalFormulaAsCont(formulaRegistry.surfaceArea.triangle, x => x.h, "výška", dim.length)
                    ),
                    deduce(
                        zakladna,
                        ...halfProduct("polovina základny")
                    ),
                    pythagoras("rameno BC", ["výška", "polovina základny"])
                ),
                contLength("rameno AC", 17),
                sum("celkem")
            ),
            ctorOption("C", 34)
        )

    }
}

function obrazec() {
    const dim = dimensionEntity("dm")
    const pulkruh = 'půlkruh'
    const ctvrtKruh = 'čtvrtkruh'
    const polomer = "poloměr"

    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    deduce(
                        deduce(
                            contLength([pulkruh, polomer], 1, "dm"),
                            evalFormulaAsCont(formulaRegistry.surfaceArea.circle, x => x.S, pulkruh, dim.area)
                        ),
                        ...halfProduct(pulkruh)
                    ),
                    deduce(
                        deduce(
                            contLength([ctvrtKruh, polomer], 2, "dm"),
                            evalFormulaAsCont(formulaRegistry.surfaceArea.circle, x => x.S, ctvrtKruh, dim.area)
                        ),
                        ...quaterProduct(ctvrtKruh)
                    ),
                    sum("šedý obrazec")
                ),
                ctorUnit("cm2")
            ),
            ctorOption("C", 471)
        )
    }
}

function procenta() {
    return {
        deductionTree: deduce(
            deduce(
                compRelative("cena na podzim", "cena v létě", 1 / 2),
                compRelativePercent("cena na jaře", "cena v létě", 25),

            ),
            ctor('convert-percent')
        )
    }
}
