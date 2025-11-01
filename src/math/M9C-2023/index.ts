import { commonSense, compRatio, cont, ctor, ctorComplement, ctorDifference, pythagoras, rate, ratio, sum, product, ctorOption, compRelative, compRelativePercent, type Container, evalExprAsCont, ctorBooleanOption, contLength, dimensionEntity, nthPart, comp, oblongNumbers, nth, counter, ctorRound, ratios, alligation, ctorRatiosInvert, percent, ctorExpressionOption, contArea, halfProduct, evalFormulaAsCont, formulaRegistry, baseAreaVolume, circleArea, triangleAngle, compAngle } from "../../components/math";
import { createLazyMap, deduce, deduceAs, last, to, toCont, toRate } from "../../utils/deduce-utils";


export default createLazyMap({
    6.1: () => trasaCesta().vyraz,
    6.2: () => trasaCesta().delka,
    7.1: () => valec().polomerPodstavy,
    7.2: () => valec().objemValce,
    8.1: () => obchod().cena,
    8.2: () => obchod().hmotnost,
    11.1: () => tabor().oddilC,
    11.2: () => tabor().oddilB,
    11.3: () => tabor().pocet,
    12: () => vagony(),
    13: () => uhly(),
    14: () => hranol(),
    15.1: () => procenta().encyklopediePocetStran,
    15.2: () => procenta().rozaPocetStran,
    15.3: () => procenta().pocetKnih,
    16.1: () => obrazce().bileCtverce,
    16.2: () => obrazce().sedeCtverce,
    16.3: () => obrazce().sedeCtverecPosledniObrazec,
})

function uhly() {
    const entity = "stupňů"
    const uhelE = deduce(
        cont("zadaný úhel u A", 55, entity),
        to(
            commonSense("rovnoramenný trojúhelník má shodné úhly u základny"),
            cont("úhel u B v rovnoramenném trojúhelníku", 55, entity)
        ),
        triangleAngle("úhel E")
    )

    const uhelB = to(
        commonSense("všechny úhly v rovnostranném trojúhelníku jsou stejné"),
        cont("úhel B v rovnostranném trojúhelníku", 60, entity)
    )

    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    deduce(
                        uhelE,
                        compAngle("úhel B (společně rovnostranný a pravoúhlý trojúhelník)", "úhel E", "alternate-interior")
                    ),
                    uhelB,
                    ctorDifference("úhel B v pravoúhlém trojúhelníku")
                ),
                cont("pravý úhel", 90, entity),
                triangleAngle("úhel 𝜔")
            ),
            ctorOption("D", 80)
        )

    }
}


function trasaCesta() {
    const entity = "délka"
    const unit = "km"

    const trasaL = "trasa"

    const vitekL = "Vítek"
    const ondraL = "Ondra"
    const rudolfL = "Rudolf"
    const rudolfToVitek = comp("Rudolf", "Vítek", -60, entity)

    const vitekPart = ratio(trasaL, vitekL, 1 / 3)
    const ondraPart = ratio(trasaL, ondraL, 2 / 5)

    const trasaX = cont(trasaL, "x", entity, unit)

    const rudolfPart = deduce(
        deduce(vitekPart, ondraPart, sum(`${vitekL} + ${ondraL}`)),
        ctorComplement(rudolfL)
    )
    return {
        vyraz: {
            deductionTree: deduce(
                deduce(
                    vitekPart,
                    trasaX
                ),
                rudolfToVitek
            )
        },
        delka: {
            deductionTree: deduce(
                deduce(
                    deduce(rudolfPart, vitekPart, ctor('comp-ratio')),
                    rudolfToVitek
                ),
                vitekPart
            )
        }
    }

}

function valec() {
    const dim = dimensionEntity();
    const polomer = deduce(
        deduceAs("podstava kvádr")(
            contLength("strana a", 8),
            contLength("strana b", 6),
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
                    contLength("výška", 12),
                    baseAreaVolume("válec")
                ),
                ctorRound(10)
            )
        }

    }
}

function obchod() {

    const entity = "korun"
    const entityBase = "hmotnost"
    const unitBase = "g"

    const arasidyL = "arašídy";
    const madleL = "mandle"
    const kesuL = "kešu"

    const prumerL = "průměr"
    const prumerCena = rate(prumerL, 20, { entity }, { entity: entityBase, unit: unitBase }, 100)

    const arasidyCena = rate(arasidyL, 8, { entity }, { entity: entityBase, unit: unitBase }, 100)
    const mandleCena = rate(madleL, 20, { entity }, { entity: entityBase, unit: unitBase }, 100)
    const kesuCena = rate(kesuL, 28, { entity }, { entity: entityBase, unit: unitBase }, 100)


    const arasidy = cont(arasidyL, 500, entityBase, unitBase);
    const kesuX = cont(kesuL, "x", entityBase, unitBase)

    return {
        cena: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        cont(arasidyL, 800, entityBase, unitBase),
                        arasidyCena
                    ),
                    deduce(
                        cont(madleL, 1200, entityBase, unitBase),
                        mandleCena
                    ),
                    sum("celkem")
                ),
                counter("polovina směsi", 1 / 2),
                product("celkem")
            )
        },
        hmotnost: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        prumerCena,
                        arasidyCena,
                        kesuCena,
                        alligation("poměr cen ve směsi")
                    ),
                    ctorRatiosInvert("poměr hmotností ve směsi")
                ),
                arasidy,
                nthPart(kesuL)
            )
        }
    }
}

function tabor() {
    const entity = "dítě"
    const oddilAChlapci = cont("oddíl A - chlapci", 9, entity)
    const oddilADivky = cont("oddíl A - dívky", 7, entity)
    const oddilBDivky = cont("oddíl B - dívky", 4, entity)

    const oddilA = deduce(
        oddilAChlapci,
        oddilADivky,
        sum("oddíl A", { entity }),
    )

    const oddilCChlapci = cont("oddíl C - chlapci", 3, entity)
    const oddilCDivky = deduce(
        deduce(
            oddilA,
            compRatio("oddíl A", "oddíl C", 2)
        ),
        oddilCChlapci,
        ctorDifference("oddíl C - dívky")
    )

    const oddilBChlapci = deduce(
        deduce(
            last(oddilA),
            ratios("počet dětí", ["oddíl A", "oddíl B"], [4, 3]),
            nthPart("oddíl B")
        ),
        oddilBDivky,
        ctorDifference("oddíl B - chlapci"),
    )


    return {
        oddilC: {
            deductionTree: deduce(
                oddilCDivky,
                ctorBooleanOption(5)
            )

        },
        oddilB: {
            deductionTree: deduce(
                deduce(
                    oddilBChlapci,
                    oddilBDivky,
                    ctor("comp-ratio")
                ),
                ctorBooleanOption(1 / 2, "closeTo", { asFraction: true })
            )
        },
        pocet: {
            deductionTree: deduce(
                deduce(
                    deduce(oddilADivky, oddilBDivky, last(oddilCDivky), sum("dívky")),
                    deduce(oddilAChlapci, last(oddilBChlapci), oddilCChlapci, sum("chlapci")),
                    ctor("comp-ratio")
                ),
                ctorBooleanOption(1 / 5, "closeTo", { asFraction: true })
            )
        }


    }
}

function hranol() {
    const dim = dimensionEntity()
    const plastL = "plášt"
    const podstavaL = "podstava"
    const podstavaArea = deduce(
        contArea("hranol", 144),
        ratios("hranol", [plastL, podstavaL, podstavaL], [2, 1, 1])
    )

    return {
        deductionTree: deduce(
            deduce(
                podstavaArea,
                deduce(
                    deduceAs("plášt hranolu (4 schodné boční stěny) je dvakrát větší než obsah podstavy, resp. bocni stena = podstava * 2 / 4 = podstava * 1/2")(
                        last(podstavaArea),
                        ...halfProduct("boční stěna")
                    ),
                    deduce(
                        last(podstavaArea),
                        evalFormulaAsCont(formulaRegistry.surfaceArea.square, x => x.a, 'strana podstavy', dim.length)
                    ),
                    evalFormulaAsCont(formulaRegistry.surfaceArea.rectangle, x => x.b, "výška", dim.length)
                ),
                baseAreaVolume("hranol")
            ),
            ctorOption("B", 108)
        )
    }
}

function procenta() {
    const entity = "knih"
    const nemecky = cont("německy psaných", 30, entity)
    const celkemKnih = deduce(
        nemecky,
        percent("knihovna", "německy psaných", 10)
    )
    return {
        encyklopediePocetStran: {
            deductionTree: deduce(
                deduce(
                    compRelativePercent("encyklopedie", "atlas", 25),
                    cont("atlas", 200, "stran")
                ),
                ctorOption("E", 250)
            )
        },
        rozaPocetStran: {
            deductionTree: deduce(
                deduce(
                    cont("kniha", 500, "stran"),
                    compRelativePercent("přečetla", "nepřečetla", 50)
                ),
                ctorExpressionOption("A", "x < 210")
            )
        },
        pocetKnih: {
            deductionTree: deduce(
                deduce(
                    celkemKnih,
                    deduce(
                        nemecky,
                        deduce(
                            last(celkemKnih),
                            ratio("knihovna", "anglicky psaných", 1 / 5)
                        ),
                        sum("německy a anglicky psaných")
                    ),
                    ctorDifference("česky psaných")
                ),
                ctorOption("B", 210)
            )
        },
    }
}
function vagony() {
    const vagonL = "vagón"
    const entity = "lokomotivních délek"
    return {
        deductionTree: deduce(
            deduce(
                to(
                    ratio("souprava", "lokomotiva", 1 / 17),
                    cont("všechny vagóny", 16, entity),
                ),
                toRate(
                    compRelative("lokomotiva", vagonL, -1 / 4), {
                    agent: "souprava", entity: { entity: vagonL }, entityBase: { entity }
                })
            ),
            ctorOption("C", 12)
        )
    }
}
function obrazce() {
    const obrazec = "obrazec";
    const sedyEntity = "šedý čtverec"
    const bilyEntity = "bílý čtverec"


    const sousedniCtverceRate = rate(obrazec, 2, sedyEntity, bilyEntity)

    const pattern = oblongNumbers({ entity: bilyEntity }, -1)

    const pocetSedychFunc = (container: Container) => {
        const pocetSloupcu = toCont(deduce(
            container,
            pattern,
            nth(bilyEntity)
        ), { agent: "spodní řada" })

        return deduce(
            deduce(
                pocetSloupcu,
                sousedniCtverceRate
            ),
            deduce(
                deduce(
                    last(pocetSloupcu),
                    evalExprAsCont("pocetRadku - 1", "levý sloupec", { entity: bilyEntity })
                ),
                sousedniCtverceRate),
            cont("rohový", 1, sedyEntity),
            sum("celkem")
        )
    }
    const nPlusRule = comp("spodní řada", "levá řada", 1, bilyEntity)

    const bilyRoh = cont("rohový", 1, bilyEntity)
    const levaRada = deduce(
        deduce(
            deduce(to(
                commonSense("106 = přidané bílé + šedý dole (2) + šedý vpravo (2)"),
                cont("přidané v posledním obrazci", 106 - 4, bilyEntity)
            ),
                bilyRoh,
                ctor("slide-invert")
            ),
            nPlusRule,
            ctor("comp-part-eq")
        ),
        bilyRoh,
        ctor("slide")
    )
    return {
        bileCtverce: {
            deductionTree: toCont(deduce(
                deduce(
                    deduce(
                        cont("spodní řada obrazce", 41, sedyEntity),
                        cont("rohový čtverec", 1, sedyEntity),
                        ctorDifference("spodní řada")
                    ),
                    sousedniCtverceRate
                ),
                pattern
            ), { agent: obrazec })
        },
        sedeCtverce: {
            deductionTree: pocetSedychFunc(cont(obrazec, 90, bilyEntity))
        },
        sedeCtverecPosledniObrazec: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        levaRada,
                        deduce(
                            last(levaRada),
                            nPlusRule
                        ),
                        sum("celkem")),
                    sousedniCtverceRate
                ),
                cont("rohový", 1, sedyEntity),
                sum("celkem")
            ),
        }
    }
}
