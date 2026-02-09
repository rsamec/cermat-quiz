import { cont, ctor, ctorOption, sum, counter, product, ctorDifference, contLength, dimensionEntity, contArea, ctorUnit, contVolume, evalFormulaAsCont, formulaRegistry, ctorPercent, ctorComplement, compRelative, ratio, doubleProduct, ctorRate } from "../../components/math";
import { createLazyMap, deduce, toCont } from "../../utils/deduce-utils";

export default createLazyMap({
    1: () => porovnani(),
    3.1: () => rovnosti().prvni,
    3.2: () => rovnosti().druha,
    3.3: () => rovnosti().treti,
    5: () => tajuplnyOstrov(),
    6: () => obdelnik(),
    7.1: () => procenta().prvni,
    7.2: () => procenta().druha,
    7.3: () => procenta().treti,

})

function porovnani() {
    return {
        deductionTree: deduce(
            deduce(
                counter("první zadané číslo", 7),
                counter("čtyřnásobek", 4),
                product("první zadané číslo")
            ),
            counter("druhé zadané číslo", 140),
            ctor("comp-ratio")
        ),
        convertToTestedValue: (value) => 1 / value.ratio
    }
}

function rovnosti() {
    const entityTime = "čas";
    return {
        prvni: {
            deductionTree: deduce(
                deduce(
                    contArea("levá strana", 0.45, "m2"),
                    ctorUnit("cm2")
                ),
                contArea("pravá strana", 20),
                ctorDifference("zbytek do rovnosti")
            )
        },
        druha: {
            deductionTree: deduce(
                deduce(
                    contVolume("pravá strana", 2, "l"),
                    ctorUnit("cm3")
                ),
                deduce(
                    contVolume("levá strana", 0.8, "dm3"),
                    ctorUnit("cm3")
                ),
                ctorDifference("zbytek do rovnosti na levé straně")
            )
        },
        treti: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        cont("pravá strana", 0.75, entityTime, "h"),
                        ctorUnit("min")
                    ),
                    counter("desetinásobek", 10),
                    product("celkem pravá strana")
                ),
                cont("levá strana", 30, entityTime, "min"),
                ctor("quota")
            )
        }
    }
}

function tajuplnyOstrov() {
    const dim = dimensionEntity();
    const ostrovLabel = "ostrov"
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    contLength(ostrovLabel, 1256, "m"),
                    cont(ostrovLabel, 4, "počet obejití"),
                    ctorRate([ostrovLabel, "obvod"])
                ),
                evalFormulaAsCont(formulaRegistry.circumReference.circle, x => x.r, "poloměr ostrova", { entity: dim.length.entity, unit: "m" })
            ),
            ctorOption("C", 50)
        )
    }
}

function obdelnik() {
    const dim = dimensionEntity();
    const AC = contLength("AC", 24);
    const SD = contLength("SD", 10);
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    SD,
                    AC,
                    evalFormulaAsCont(formulaRegistry.surfaceArea.triangle, x => x.S, "trojúhelník ACD", dim.area)
                ),
                ...doubleProduct("obdelník ABCD")

            ),
            ctorOption("D", 240)
        )

    }
}

function procenta() {
    const entityDeti = "děti";
    const entitySamolepky = "samolepky"
    const entityCena = "cena"
    const unit = "Kč"

    const tabor = cont("tábor", 2_400, entityCena, unit)
    return {
        prvni: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        cont("ubytováno ve stanech", 120, entityDeti),
                        cont("tábor celkem", 160, entityDeti),
                        ctorPercent()
                    ),
                    ctorComplement("nebylo ubytováno ve stanech")
                ),
                ctorOption("B", 25, { asPercent: true })
            )
        },
        druha: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        compRelative("Petr", "Lukáš", 1 / 4),
                        ctor("invert-comp-ratio")
                    ),
                    ctor("convert-percent")
                ),
                ctorOption("A", 20, { asPercent: true })
            )
        },
        treti: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        deduce(
                            deduce(
                                tabor,
                                ratio("tábor", "doprava", 1 / 5)
                            ),
                            cont("ubytování", 1_080, entityCena, unit),
                            sum("doprava a ubytování")
                        ),
                        tabor,
                        ctorPercent()
                    ),
                    ctorComplement('stravování')
                ),
                ctorOption("E", 35, { asPercent: true })
            )
        }
    }
}