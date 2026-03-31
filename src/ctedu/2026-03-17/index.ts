
import { compRatio, cont, contAngle, contLength, counter, ctor, ctorBooleanOption, ctorDifference, ctorLinearEquation, ctorOption, ctorUnit, dimensionEntity, evalFormulaAsCont, formulaRegistry, nthPart, ratios, sum } from "../../components/math";
import { createLazyMap, deduce, last } from "../../utils/deduce-utils";

export default createLazyMap({
    1: () => vypocet(),
    4.1: () => les().zajici,
    4.2: () => les().divocaci,
    5.1: () => vylet().a,
    5.2: () => vylet().b,
    5.3: () => vylet().c,
    6: () => rozdeleniObdelniku(),
})


function vypocet() {
    return {
        deductionTree: deduce(
            contAngle("1. úhel", 12, "arcmin"),
            deduce(
                deduce(
                    contAngle("2. úhel", 6),
                    ctorUnit("arcmin")
                ),
                contAngle("2. úhel", 24, "arcmin"),
                sum("2. úhel")
            ),
            ctor('comp-ratio')
        ),
        convertToTestedValue: (value) => 1 / value.ratio
    }
}

function les() {
    const entityPrase = "divočák";
    const entityZajic = "zajíc";
    const predSezonouPrase = cont(["před sezónou"], "x", entityPrase);

    const poSezoneZajic = deduce(
        deduce(
            predSezonouPrase,
            compRatio(entityPrase, entityZajic, 3)
        ),
        cont("zastřeleno", 12, entityZajic),
        ctorDifference("po sezóně")
    )
    const zastrelono = cont("zastřeleno", 15, entityPrase);
    const poSezoneDivocak = deduce(
        predSezonouPrase,
        zastrelono,
        ctorDifference("po sezóně")
    )
    return {
        zajici: {
            deductionTree: poSezoneZajic,
        },
        divocaci: {
            deductionTree: deduce(
                deduce(
                    last(poSezoneZajic),
                    deduce(
                        last(poSezoneDivocak),
                        compRatio(entityPrase, entityZajic, 6)
                    ),
                    ctorLinearEquation("před sezónou", { entity: entityPrase }, "x")
                ),
                zastrelono,
                ctorDifference("po sezóně")
            )
        }
    }
}

function vylet() {
    const entityMinutes = { entity: "doba", unit: "min" }

    const doba = cont("celkem doba výletu", 291, entityMinutes.entity, entityMinutes.unit)
    const zdrzeni = cont("zdržení", 90, entityMinutes.entity, entityMinutes.unit)
    const cistaDoba = deduce(
        doba,
        zdrzeni,
        ctorDifference("doba cesty")
    )

    const cestaParts = ratios("doba cesty", ["cesta do cukrárny", "cesta zpět"], [2, 1]);
    const cestaTam = deduce(
        cistaDoba,
        cestaParts,
        nthPart("cesta do cukrárny")
    )
    const cestaZpet = deduce(
        last(cistaDoba),
        cestaParts,
        nthPart("cesta zpět")
    )
    return {
        a: {
            deductionTree: deduce(
                cestaTam,
                ctorBooleanOption(120, "smaller")
            )
        },
        b: {
            deductionTree: deduce(
                cestaZpet,
                ctorBooleanOption(67)
            )
        },
        c: {
            deductionTree: deduce(
                deduce(
                    contLength("cesta zpět", 32, "km"),
                    deduce(cestaZpet, ctorUnit("h")),
                    evalFormulaAsCont(formulaRegistry.speed, x => x.v, "průměrná rychlost", { entity: "rychlost", unit: "km/h" })
                ),
                ctorBooleanOption(16, "smaller")
            )
        },
    }
}

function rozdeleniObdelniku() {
    const dim = dimensionEntity();
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    contLength("obvod ABCD", 72),
                    cont("obvod ABCD", 6, "strana"),
                    ctor("rate")
                ),
                evalFormulaAsCont(formulaRegistry.surfaceArea.square, x => x.S, "obsah", dim.area)
            ),
            ctorOption("D", 144)
        )
    }
}