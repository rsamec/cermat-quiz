import { ctor, ctorOption, sum, ratio, ctorUnit, compRelativePercent, compRelative, contAngle, cont, ctorDifference, ctorLinearEquation, nthPart } from "../../components/math";
import { createLazyMap, deduce, last } from "../../utils/deduce-utils";

export default createLazyMap({
    1: () => vypocet(),
    4.1: () => firma().zeny,
    4.2: () => firma().muzi,
    4.3: () => firma().celkemZen,
    5: () => plaveckyBazen(),
    6: () => procenta(),
    7: () => problemy(),
})

function vypocet() {
    return {
        deductionTree: deduce(
            contAngle("1. úhel", 25, "arcmin"),
            deduce(
                contAngle("2. úhel", 5),
                ctorUnit("arcmin")
            ),
            ctor('comp-ratio')
        ),
        convertToTestedValue: (value) => 1 / value.ratio 
    }
}

function firma() {
    const entity = "osob";
    const zeny = cont(["firma", "zaměstnané ženy"], "x", entity)
    const celkem = cont(["firma", "zaměstnáno celkem"], 200, entity)

    const zenyNaPracovisti = deduce(
        ratio("zaměstnané ženy", "včera na pracovišti", 1 / 3),
        zeny
    )
    const muziNaPracovisti = deduce(
        ratio("zaměstnaní muži", "včera na pracovišti", 2 / 5),
        deduce(celkem,
            zeny,
            ctorDifference("zaměstnaní muži")
        )
    )

    return {
        zeny: {
            deductionTree: zenyNaPracovisti
        },
        muzi: {
            deductionTree: muziNaPracovisti
        },
        celkemZen: {
            deductionTree: deduce(
                deduce(
                    last(zenyNaPracovisti),
                    last(muziNaPracovisti),
                    sum("včera na pracovišti celkem")
                ),
                cont(["firma", "včera na pracovišti celkem"], 70, entity),
                ctorLinearEquation("zaměstnané ženy", { entity }, "x")
            )
        }
    }
}

function plaveckyBazen() {
    const entity = "dospělých"
    return {
        deductionTree: deduce(
            deduce(
                cont("celkem", 680, entity),
                compRelativePercent("muži", "ženy", -30),
                nthPart("muži")
            ),
            ctorOption("E", 280)
        )
    }
}

function procenta() {
    const entity = "Kč"
    const cenaPoSleve = deduce(
        cont(["kolo", "původně"], 30_000, entity),
        compRelativePercent("zlevněno", "původně", -20)
    )
    return {
        deductionTree: deduce(
            deduce(
                cenaPoSleve,
                compRelativePercent("zdraženo", "zlevněno", 20)
            ),
            ctorOption("C", 28_800)
        )
    }
}


function problemy() {
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    compRelative("Klára", "Petr", -1 / 5),
                    ctor("invert-comp-ratio")
                ),
                ctor("convert-percent")
            ),
            ctorOption("D", 25, { asPercent: true })
        )
    }
}
