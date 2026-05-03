import { cont, ctor, ctorOption, sum, ctorDifference, contLength, ctorPercent, rate, lcd, doubleProduct, compRatio, ctorUnit, compRelativePercent, wholePercent, counterPercent } from "../../components/math";
import { createLazyMap, deduce, last, toPercent } from "../../utils/deduce-utils";

export default createLazyMap({
    1: () => veslarka(),
    4.1: () => aquapark().toboganJizdy,
    4.2: () => aquapark().zetony,

    7.1: () => pekar().a,
    7.2: () => pekar().b,
    7.3: () => pekar().c,

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