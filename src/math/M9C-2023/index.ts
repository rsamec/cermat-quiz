import { commonSense, compAngle, compRatio, cont, ctor, ctorComplement, ctorDifference, ctorComparePercent, ctorUnit, pythagoras, rate, ratio, sum, product, ctorSlide, double, ctorPercent, ctorOption, compRelative, compRelativePercent, type Container, evalExprAsCont, ctorScaleInvert, ctorBooleanOption, triangleAngle, contLength, contArea, dimensionEntity, triangularNumbersPattern, nthPart, comp, ctorSlideInvert, quota, oblongNumbers, rectangularNumbersPatternLower, nth } from "../../components/math";
import { createLazyMap, deduce, deduceAs, last, lastQuantity, to, toCont, toPredicate } from "../../utils/deduce-utils";


export default createLazyMap({
    16.1: () => obrazce().bileCtverce,
    16.2: () => obrazce().sedeCtverce,
    16.3: () => obrazce().sedeCtverecPosledniObrazec,
})

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
