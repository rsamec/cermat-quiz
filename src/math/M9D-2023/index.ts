import { commonSense, compRatio, cont, ctor, ctorDifference, rate, sum, ctorSlide, compRelative, compRelativePercent, triangularNumbersPattern, nthPart, comp, ratios, counter, ctorRatios, nthPartFactor, ctorOption, ctorBooleanOption, ctorExpressionOption } from "../../components/math";
import { createLazyMap, deduce, lastQuantity, to } from "../../utils/deduce-utils";


export default createLazyMap({
    1: () => zavazi(),
    2.1: () => ciselnaOsa().bodC,
    2.2: () => ciselnaOsa().bodB,
    6.1: () => vysazovaniStromu().sobota,
    6.2: () => vysazovaniStromu().nedele,
    6.3: () => vysazovaniStromu().patek,
    7.1: () => parkoviste().osobnichAut,
    7.2: () => parkoviste().autobus,

    15.1: () => procenta().loni,
    15.2: () => procenta().zaci,
    15.3: () => procenta().muzi,
    16.1: () => obrazce().pocetUsecek,
    16.2: () => obrazce().rozdilPuntiku,
    16.3: () => obrazce().pocetUsecekPro300Puntiku,
})

function zavazi() {
    const small = "lehčí"
    const big = "těžší"
    return {
        deductionTree: deduce(
            ratios("závaží", [small, big], [3, 5]),
            comp(small, big, -600, { entity: "hmotnost", unit: "g" }),
            nthPart(small)
        )
    }
}

function ciselnaOsa() {
    const entity = "úsek"
    const znamaHodnota = counter("známé číslo", 20)
    return {
        bodC: {
            deductionTree: to(
                commonSense("A je zmenšené o 2 dílky a B je naopak zvětšené o 2 dílky, tj. při součtu A+B se změny vyruší"),
                counter("C = součet A+B", 40)
            )
        },
        bodB: {
            deductionTree: deduce(
                znamaHodnota,
                deduce(
                    deduce(
                        deduce(
                            counter("C", 40),
                            znamaHodnota,
                            ctorDifference("rozdíl")
                        ),
                        cont("rozdíl", 5, entity),
                        ctor("rate"),
                    ),
                    cont("posun B", 2, entity)
                ),
                ctorSlide("B")
            )
        },
    }
}

function vysazovaniStromu() {
    const entity = "stromy"
    const pocetStromu = cont("pátek", "p", entity)

    const sobotaToPatek = compRelative("sobota", "pátek", 1 / 3)
    const nedeleToPatek = compRelativePercent("neděle", "pátek", 60)
    return {
        sobota: {
            deductionTree: deduce(
                sobotaToPatek,
                pocetStromu,
            )
        },
        nedele: {
            deductionTree: deduce(
                nedeleToPatek,
                pocetStromu,
            )
        },
        patek: {
            deductionTree:
                deduce(
                    deduce(
                        sobotaToPatek,
                        nedeleToPatek,
                        sum("sobota a neděle")
                    ),
                    comp("pátek", "sobota a neděle", -290, entity)
                )
        },
    }
}

function parkoviste() {
    const entity = "míst";
    const parkoviste = cont("parkoviště", 105, entity)
    return {
        osobnichAut: {
            deductionTree: deduce(
                deduce(
                    compRatio("autobus", "auto", 4),
                    parkoviste,
                ),
                rate("parkoviště", 1, entity, "auto")
            )
        },
        autobus: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        compRelative("auto", "autobus", 1 / 4),
                        ctorRatios("parkoviště"),
                    ),
                    rate("parkoviště", 4, entity, "autobus"),
                    nthPartFactor("autobus")
                ),
                parkoviste,
                nthPart("autobus")
            )
        },
    }
}

function procenta() {
    const entity = "uchazečů"
    const zaci = "žáci"
    const dospely = "dospělý"
    return {
        loni: {
            deductionTree: deduce(
                deduce(
                    cont("letos", 420, entity),
                    compRelativePercent("letos", "loni", 40)
                ),
                ctorOption("E", 300)
            )
        },
        zaci: {
            deductionTree: deduce(
                deduce(
                    cont("čeština", 180, zaci),
                    compRelativePercent("čeština", "matika", -25)
                ),
                ctorOption("B", 240)
            )
        },
        muzi: {
            deductionTree: deduce(
                deduce(
                    cont("bazén", 680, dospely),
                    compRelativePercent("muži", "ženy", -30),
                    nthPart("muži")
                ),
                ctorOption("D", 280)
            )
        }


    }
}

function obrazce() {
    const entity = "pater";
    const trojUhelnik = "trojúhleník";
    const usecky = "úsečka"
    const puntiky = "puntiky"


    const useckaVsTrojuhelnik = compRatio(usecky, trojUhelnik, 3)
    const posledniObrazec = deduce(
        comp("poslední obrazec", "předposlední obrazec", 96, usecky),
        useckaVsTrojuhelnik,
        ctor('comp')
    )

    return {
        pocetUsecek: {
            deductionTree: deduce(
                deduce(
                    cont("obrazec č.5", 5, entity),
                    triangularNumbersPattern({ entity: trojUhelnik })
                ),
                useckaVsTrojuhelnik
            )
        },
        rozdilPuntiku: {
            deductionTree: to(
                commonSense("počet puntíků = počet trojúhleníků v následujícím obrazci"),
                posledniObrazec,
                cont("přidáno v posledním obrazci + 1", lastQuantity(posledniObrazec) + 1, "puntíky")
            )
        },
        pocetUsecekPro300Puntiku: {
            deductionTree: deduce(
                to(
                    commonSense("počet puntíků = počet trojúhleníků v následujícím obrazci"),
                    cont("obrazec", 300, puntiky),
                    cont("následující obrazec", 300, trojUhelnik)
                ),
                useckaVsTrojuhelnik
            )
        }
    }
}
