import { cont, ctor, ctorOption, sum, ctorDifference, contLength, ctorPercent, rate, lcd, doubleProduct, compRatio, ctorUnit, compRelativePercent, wholePercent, counterPercent, product, ratio, comp, ratios, nthPart, contArea, evalFormulaAsCont, formulaRegistry, dimensionEntity } from "../../components/math";
import { createLazyMap, deduce, last, toPercent } from "../../utils/deduce-utils";

export default createLazyMap({
    1: () => veslarka(),
    4.1: () => aquapark().toboganJizdy,
    4.2: () => aquapark().zetony,

    6.1: () => barevneSamolepky().a,
    6.2: () => barevneSamolepky().b,

    7.1: () => pekar().a,
    7.2: () => pekar().b,
    7.3: () => pekar().c,
    11: () => testMatematika(),
    12: () => sportovniDen(),
    13: () => krabicka().a,
    14: () => krabicka().b,
    15.1: () => procenta().a,
    15.2: () => procenta().b,
    15.3: () => procenta().c,

})

function veslarka() {
    const entityBase = { entity: "čas", unit: "min" }
    return {
        deductionTree: deduce(
            deduce(
                cont(["veslařka", "ujede"], 6, entityBase.entity, entityBase.unit),
                cont(["veslařka", "ujela"], 1.5, entityBase.entity, entityBase.unit),
                ctor("comp-ratio")
            ),
            contLength(["veslařka", "ujela"], 350, "m")
        )
    }
}

function aquapark() {
    const toboganLabel = "tobogán"
    const clunLabel = "člun"
    const entityBase = "žeton"
    const entity = "jízda"


    const toboganRate = rate(toboganLabel, 3, entity, entityBase, 4)
    const clunRate = rate(clunLabel, 2, entity, entityBase, 15)
    const tobogan = deduce(
        deduce(
            cont(toboganLabel, 3, entity),
            cont(clunLabel, 2, entity),
            lcd("nejmenší společný počet jízd", entity)
        ),
        ...doubleProduct(toboganLabel)
    )
    return {
        toboganJizdy: {
            deductionTree: deduce(
                deduce(
                    cont("Petr", 70, entityBase),
                    deduce(
                        cont(clunLabel, 4, entity),
                        clunRate,
                    ),
                    ctorDifference(toboganLabel)
                ),
                toboganRate
            )
        },
        zetony: {
            deductionTree: deduce(
                deduce(
                    tobogan,
                    toboganRate
                ),
                deduce(
                    deduce(
                        last(tobogan),
                        compRatio(toboganLabel, clunLabel, 2)
                    ),
                    clunRate
                ),
                sum("Nela celkem")
            )
        }

    }
}

function pekar() {
    const entity = { entity: "curk", unit: 'g' }
    const babovkyEntity = "bábovka"
    const babovky = cont("spotřeba dle receptu", 6, babovkyEntity)
    const babovky3 = cont("spotřeba dle receptu - polovina", 3, babovkyEntity)
    const babovkyCil = cont("hledaná spotřeba", 21, babovkyEntity)

    const cukr = cont("spotřeba dle receptu", 840, entity.entity, entity.unit);

    const babovkaUnitRate = deduce(
        cukr,
        babovky,
        ctor('rate')
    )
    return {
        a: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        babovky,
                        babovky3,
                        ctor('comp-ratio')
                    ),
                    cukr
                ),
                deduce(
                    babovky3,
                    babovkyCil,
                    ctor('comp-ratio')
                )
            )
        },
        b: {
            deductionTree: deduce(
                deduce(
                    cont("spotřeba v pekárně", 7, entity.entity, "kg"),
                    ctorUnit("g")
                ),
                babovkaUnitRate
            )
        },
        c: {
            deductionTree: deduce(
                cont("vánočka", 27, "kus"),
                compRelativePercent("vánočka", "bábovka", -25)
            )
        },
    }
}

function procenta() {
    const entity = "sazenice"
    const agentVsechnyDny = "všechny tři dny"

    const prvniDen = deduce(
        wholePercent(),
        counterPercent("zbývá po 1. den", 60),
        ctorDifference("1.den")
    )
    const prvniADruhyDen = deduce(
        prvniDen,
        compRelativePercent("1.den a 2.den", "1.den", 50),
    )
    const tretiDen = deduce(
        wholePercent(),
        last(prvniADruhyDen),
        ctorDifference("3.den")
    )

    return {
        a: {
            deductionTree: deduce(
                deduce(
                    prvniADruhyDen,
                    last(prvniDen),
                    ctorDifference("2.den")
                ),
                ctorOption("A", 20)
            )
        },
        b: {
            deductionTree: deduce(
                tretiDen,
                ctorOption("E", 40)
            )
        },
        c: {
            deductionTree: deduce(
                deduce(
                    cont("Jarka", 162, entity),
                    deduce(
                        cont("3.den", 216, entity),
                        toPercent(last(tretiDen), { whole: agentVsechnyDny })
                    ),
                    ctorPercent()
                ),
                ctorOption("C", 30, { asPercent: true })
            )
        }
    }
}

function testMatematika() {
    const entity = "hodnota"
    const entityBase = "počet"
    const cetnosti = [6, 5, 2, 3, 4]
    return {
        deductionTree: deduce(
            deduce(
                cont("známky", cetnosti.reduce((out, d, i) => out += (d * (i + 1)), 0), entity),
                cont("známky", cetnosti.reduce((out, d) => out += d, 0), entityBase),
                ctor('rate')
            ),
            ctorOption("A", 2.7)
        )
    }
}

function barevneSamolepky() {
    const entity = "čtverec"
    const obdelnikAgent = "obdelník"

    const celkem = deduce(
        cont([obdelnikAgent, "délka"], 30, entity),
        cont([obdelnikAgent, "šírka"], 20, entity),
        product("celkem")
    )
    const cervene = deduce(
        celkem,
        ratio("celkem", "červené", 1 / 5)
    )
    const cerveneAModre = deduce(
        cervene,
        deduce(
            deduce(
                last(celkem),
                last(cervene),
                ctorDifference("zbytek")
            ),
            ratio("zbytek", "modré", 1 / 3)
        ),
        sum("červené a modré")
    )
    return {
        a: {
            deductionTree: cerveneAModre
        },
        b: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        last(celkem),
                        last(cerveneAModre),
                        ctorDifference("zbytek")
                    ),
                    comp("zelené", "žluté", -20, entity),
                    ctor('comp-part-eq')
                ),
                last(celkem),
                ctor('ratio')
            )
        }
    }
}

function sportovniDen() {
    const entity = "žáků"
    const b = deduce(
        ratios("skupiny", ["A", "B"], [7, 9]),
        comp("B", "A", 16, entity)
    )
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    b,
                    ratios("skupiny", ["B", "C"], [4, 7]),
                    nthPart('C')
                ),
                last(b)
            ),
            ctorOption("C", 54)
        )
    }
}

function krabicka() {
    const dim = dimensionEntity();
    const a = contLength(["nejdelší hrana krabička", "strana a"], 14)
    const c = deduce(
        deduce(
            contArea("papír", 16),
            cont("papír", 4, "roh"),
            ctor('quota')
        ),
        evalFormulaAsCont(formulaRegistry.surfaceArea.square, x => x.a, ["roh", "strana c"], dim.length)
    );

    const rohy = deduce(
        c,
        ...doubleProduct("ohy po stranách")
    )
    const papirDelka = deduce(
        rohy,
        contLength(["nejdelší hrana krabička", "strana a"], 14),
        sum(["papír", "delší strana"].join())
    )

    return {
        a: {
            deductionTree: deduce(
                papirDelka,
                ctorOption("B", 18)
            )
        },
        b: {
            deductionTree: deduce(
                deduce(
                    a,
                    deduce(
                        deduce(
                            contArea("papír", 198),
                            last(papirDelka),
                            evalFormulaAsCont(formulaRegistry.surfaceArea.rectangle, x => x.b, ["papír", "kratší strana"], dim.length)
                        ),
                        last(rohy),
                        ctorDifference(["hrana krabička", "strana b"].join())
                    ),
                    last(c),
                    evalFormulaAsCont(formulaRegistry.volume.cuboid, x => x.V, "krabička", dim.volume)
                ),
                ctorOption("B", 196)
            )
        },
    }
}