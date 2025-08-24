import { commonSense, compAngle, compRatio, cont, ctor, ctorComplement, ctorDifference, ctorComparePercent, ctorUnit, pythagoras, rate, ratio, sum, product, ctorSlide, double, ctorPercent, ctorOption, compRelative, compRelativePercent, type Container, evalExprAsCont, ctorScaleInvert, ctorBooleanOption, triangleAngle, contLength, contArea, dimensionEntity, triangularNumbersPattern, nthPart, comp, ctorSlideInvert, quota, oblongNumbers, rectangularNumbersPatternLower, nth, productVolume, counter, ctorRound, ratios, ctorLinearEquation, ctorRatios, alligation, ctorRatiosInvert } from "../../components/math";
import { createLazyMap, deduce, deduceAs, last, lastQuantity, to, toCont, toPredicate } from "../../utils/deduce-utils";


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


    16.1: () => obrazce().bileCtverce,
    16.2: () => obrazce().sedeCtverce,
    16.3: () => obrazce().sedeCtverecPosledniObrazec,
})

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
        counter("polovina", 1 / 2),
        product("poloměr")
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
                        evalExprAsCont("π*r^2", { kind: 'cont', agent: "podstava", ...dim.area })
                    ),
                    contLength("výška", 12),
                    productVolume("válec")
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
                    evalExprAsCont("pocetRadku - 1", { kind: "cont", agent: "levý sloupec", entity: bilyEntity })
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
