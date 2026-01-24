import { cont, ctor, ctorOption, sum, counter, product, ctorDifference, contLength, dimensionEntity, contArea, ctorUnit, contVolume, evalFormulaAsCont, formulaRegistry, ctorPercent, ctorComplement, compRelative, ratio, doubleProduct, halfProduct, pythagoras, evalExprAsCont, circleArea, baseAreaVolume, ctorRound, triangleArea } from "../../components/math";
import { createLazyMap, deduce, deduceAs, last, toCont } from "../../utils/deduce-utils";

export default createLazyMap({
    1: () => strihaniCtvercu(),
    2.1: () => kosoctverec().prvni,
    2.2: () => kosoctverec().druha,
    3.1: () => dort().prumer,
    3.2: () => dort().objem,
    4.1: () => ctverec().strana,
    4.2: () => ctverec().obvod,
    5.1: () => valec().polomerPodstavy,
    5.2: () => valec().objemValce,
    6.1: () => triangleExample().obsahABD,
    6.2: () => triangleExample().obsahABCD,
})

function strihaniCtvercu() {
    const dim = dimensionEntity();
    return {
        deductionTree: deduce(
            deduce(
                toCont(deduce(
                    deduce(
                        contArea("obdélník", 7.2, "dm2"),
                        ctorUnit("cm2")
                    ),
                    counter("čtverec", 20),
                    ctor("quota")
                ), { agent: 'čtverec' }),
                evalFormulaAsCont(formulaRegistry.surfaceArea.square, x => x.a, "čtverec", dim.length)
            ),
            evalFormulaAsCont(formulaRegistry.circumReference.square, x => x.o, "čtverec", dim.length)
        )
    }
}

function kosoctverec() {
    const dim = dimensionEntity();

    const stranaAL = deduce(
        contLength("strana KM", 24),
        ...halfProduct("strana AL")
    )
    const stranaAK = deduce(
        deduce(
            contArea("trojúhleník ALK", 30),
            ...doubleProduct("obdélník KLSK")
        ),
        stranaAL,
        evalFormulaAsCont(formulaRegistry.surfaceArea.rectangle, x => x.b, "strana AK", dim.length)
    )

    return {
        prvni: {
            deductionTree: deduce(
                stranaAK,
                ...doubleProduct("AD")
            )
        },
        druha: {
            deductionTree: deduce(
                deduce(
                    last(stranaAL),
                    last(stranaAK),
                    pythagoras("LK", ["AK", "AL"])
                ),
                cont("kosočtverec KLMN", 4, "strana"),
                product("kosočtverec KLMN")
            )
        }
    }
}

function dort() {
    const dim = dimensionEntity();
    const stranaCtverce = deduce(
        deduce(
            contArea("řez dortem", 200),
            ...halfProduct("polovina řezu dortem")
        ),
        evalFormulaAsCont(formulaRegistry.surfaceArea.square, x => x.a, "strana čtverce", dim.length)
    )


    return {
        prumer: {
            deductionTree: deduce(
                deduce(
                    counter("hodnota", 144),
                    evalExprAsCont("sqrt(x)", "poloměr tácu", dim.length)
                ),
                ...doubleProduct("průměr tácu")
            )
        },
        objem: {
            deductionTree: deduce(
                deduce(
                    stranaCtverce,
                    evalFormulaAsCont(formulaRegistry.surfaceArea.circle, x => x.S, "plocha základny dortu", dim.area)
                ),
                toCont(last(stranaCtverce), { agent: "výška dortu" }),
                product("dort",[], dim.volume)
            )
        }
    }
}

function ctverec() {
    const dim = dimensionEntity();

    const ctverecKLMN = deduce(
        contArea("černá plocha", 27),
        deduce(
            deduce(
                counter("bílý čtverec", 12),
                evalFormulaAsCont(formulaRegistry.circumReference.square, x => x.a, "bílý čtverec", dim.length)
            ),
            evalFormulaAsCont(formulaRegistry.surfaceArea.square, x => x.S, "bílý čtverec", dim.area)
        ),
        sum("čtverec KLMN")
    )
    return {
        strana: {
            deductionTree: deduce(
                ctverecKLMN,
                evalFormulaAsCont(formulaRegistry.surfaceArea.square, x => x.a, "strana LM", dim.length)
            )
        },
        obvod: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        last(ctverecKLMN),
                        contArea("šedá plocha", 64),
                        sum("čtverec ABCD")
                    ),
                    evalFormulaAsCont(formulaRegistry.surfaceArea.square, x => x.a, "strana AB", dim.length)
                ),
                evalFormulaAsCont(formulaRegistry.circumReference.square, x => x.o, "čtverec ABCD", dim.length)
            )
        }
    }
}

function valec() {
    const polomer = deduce(
        deduceAs("podstava kvádr")(
            contLength("strana a", 16),
            contLength("strana b", 12),
            pythagoras("uhlopříčka", ["strana a", "strana b"])
        ),
        ...halfProduct("poloměr")
    )
    return {
        polomerPodstavy: {
            deductionTree: polomer
        },
        objemValce: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        polomer,
                        circleArea("podstava")
                    ),
                    contLength("výška", 20),
                    baseAreaVolume("válec")
                ),
                ctorRound(100)
            )
        }

    }
}

export function triangleExample() {

    const height = contLength("výška BC", 10);
    const abd = deduce(
        contLength("základna AB", 8),
        height,
        triangleArea("trojúhelník ABD")
    );
    return {
        obsahABD: {
            deductionTree: abd
        },
        obsahABCD: {
            deductionTree: deduce(
                last(abd),
                deduce(
                    contLength("základna CD", 12),
                    height,
                    triangleArea("trojúhelník BCD")
                ),
                sum("obsah ABCD")
            )
        }
    }
}