import { ctor, ctorOption, sum, ratio, ctorUnit, compRelativePercent, compRelative, contAngle, cont, ctorDifference, ctorLinearEquation, nthPart, compRatio, proportion, percent, ratios, ctorComparePercent, rate, contLength, dimensionEntity, ctorRatios, ctorRate, ctorBooleanOption, evalFormulaAsCont, formulaRegistry, productCombine } from "../../components/math";
import { createLazyMap, deduce, last } from "../../utils/deduce-utils";

export default createLazyMap({
    1: () => maliri(),
    2.1: () => svadleny().dobaPleteni,
    2.2: () => svadleny().pocetOsob,
    2.3: () => svadleny().dobaPleteniRuznyPocetOsob,
    3.1: () => finacniMatika().vraceno,
    3.2: () => finacniMatika().urokPoDani,
    3.3: () => finacniMatika().cena,
    4: () => beh(),
    5.1: () => meritko().sirka,
    5.2: () => meritko().delka,
    5.3: () => meritko().obsah,
    6.1: () => procenta().neznameCislo,
    6.2: () => procenta().procento,
    6.3: () => procenta().cerpadla,

})

function maliri() {
    const entityOsob = "malířů"
    const entity = "velikost"
    const timeEntity = {
        entity: "doba",
        unit: "hodin"
    }

    const puvodne = "původně"
    const nove = "nově"

    const zakazkaLabel = "zakázka"
    const maliruLabel = "malířů"
    const dobaLabel = "doba";
    return {
        deductionTree: deduce(
            compRelative([nove, zakazkaLabel].join(" "), [puvodne, zakazkaLabel].join(" "), 1 / 2),
            deduce(
                deduce(
                    deduce(
                        cont(nove, 4, entityOsob),
                        cont(puvodne, 5, entityOsob),
                        ctor('comp-ratio')
                    ),
                    proportion(true, [maliruLabel, dobaLabel])
                ),
                cont([[puvodne, zakazkaLabel].join(" "), puvodne, dobaLabel], 24, timeEntity.entity, timeEntity.unit)
            ),
        )
    }
}

function svadleny() {
    const entityOsob = "švadleny"
    const entity = "velikost"
    const timeEntity = {
        entity: "doba",
        unit: "dní"
    }
    const puvodne = "původně"
    const nove = "nově"

    const osobLabel = "počet švadlen";
    const dobaLabel = "doba pletení";
    const zakazka = "upletení celého svetru"

    const dobaPleteniDny = cont([puvodne, dobaLabel, zakazka], 20, timeEntity.entity, timeEntity.unit)
    const dobaPleteni = (noveQuantity: number) => deduce(
        deduce(
            deduce(
                cont(nove, noveQuantity, entityOsob),
                cont(puvodne, 10, entityOsob),
                ctor('comp-ratio')
            ),
            proportion(true, ["počet švadlen", dobaLabel])
        ),
        dobaPleteniDny
    )


    return {
        dobaPleteni: {
            deductionTree: deduce(
                dobaPleteni(4),
                ctorOption("E", 50)
            )
        },
        pocetOsob: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        deduce(
                            cont(nove, 5, timeEntity.entity, timeEntity.unit),
                            cont(puvodne, 20, timeEntity.entity, timeEntity.unit),
                            ctor('comp-ratio')
                        ),
                        proportion(true, [osobLabel, dobaLabel])
                    ),
                    cont([puvodne, osobLabel], 10, entityOsob)
                ),
                ctorOption("D", 40)
            )
        },
        dobaPleteniRuznyPocetOsob: {
            deductionTree: deduce(
                deduce(
                    dobaPleteni(8),
                    ratio(zakazka, "1. polovina", 1 / 2),
                ),
                ctorOption("B", 12.5)
            )
        }
    }
}

function finacniMatika() {

    const entity = 'Kč'
    const pujckaLabel = "vypůjčená částka"
    const vkladLabel = "vklad"
    const urokLabel = "úrok"
    const srazkovaDan = percent(urokLabel, "srážková daň", 15)

    const pujcka = cont(pujckaLabel, 10_000, entity)
    const vklad = cont(vkladLabel, 500_000, entity)



    const urokKeVkladu = deduce(
        vklad,
        percent(vkladLabel, urokLabel, 3)
    )
    return {
        vraceno: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        pujcka,
                        percent(pujckaLabel, urokLabel, 16)
                    ),
                    pujcka,
                    sum("vrácená částka")
                ),
                ctorOption("D", 11_600)
            )
        },
        urokPoDani: {
            deductionTree: deduce(
                deduce(
                    urokKeVkladu,
                    deduce(
                        last(urokKeVkladu),
                        srazkovaDan
                    ),
                    ctorDifference("úrok po odečtení srážkové daně")
                ),
                ctorOption("F", "jiný výsledek")
            )
        },
        cena: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        cont(["tenisky", "leden"], 8_000, entity),
                        compRelativePercent("únor", "leden", 10)
                    ),
                    compRelativePercent("březen", "únor", 10)
                ),
                ctorOption("A", 9_680)
            )
        }
    }
}

function beh() {
    const entity = "doba"
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    deduce(
                        cont("Albert", 1, entity, "h"),
                        ctorUnit("min")
                    ),
                    cont("Albert", 42, entity, "min"),
                    sum("Albert")
                ),
                ratios("doba běhu", ["Hugo", "Albert"], [2, 3]),
                nthPart("Hugo")
            ),
            cont("hodin", 60, entity, "min"),
            ctor("quota")
        ),
        convertToTestedValue: (value) => ({ hodin: value.quantity, minut: value.restQuantity })
    }
}

function procenta() {
    const entity = "litr"
    const entityBase = "hodin"
    const vykon = compRatio("nižší výkon", "vyšší výkon", 3 / 7)
    const vyssiVykon = rate("vyšší výkon", 560, entity, entityBase, 2)

    return {
        neznameCislo: {
            deductionTree: deduce(
                deduce(
                    cont("zvětšené číslo", 777, ""),
                    compRelativePercent("zvětšené číslo", "neznámé číslo", 5)
                ),
                ctorOption("D", 740)
            )
        },
        procento: {
            deductionTree: deduce(
                deduce(
                    cont("zvětšené číslo", 7 / 8, ""),
                    cont("původní číslo", 1 / 4, ""),
                    ctorComparePercent()
                ),
                ctorOption("A", 250, { asPercent: true, asRelative: true })
            )
        },
        cerpadla: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        vykon,
                        vyssiVykon
                    ),
                    cont("nižší výkon", 5, entityBase)
                ),
                ctorOption("C", 600)
            )
        },

    }
}


function meritko() {
    const dim = dimensionEntity();
    const skutecnostLabel = "skutečnost"
    const planLabel = "plán"
    const widthLabel = "šířka"
    const lengthLabel = "délka"

    const skutecnostSirka = cont([widthLabel], 12, skutecnostLabel, "m");
    const planSirka = cont([widthLabel], 4, planLabel, "cm");
    const planDelka = deduce(
        cont([lengthLabel], 0.75, planLabel, "dm"),
        ctorUnit("cm")
    )

    const meritko = (label) => deduce(
        deduce(
            cont([label], 12, skutecnostLabel, "m"),
            ctorUnit("cm")
        ),
        cont([label], 4, planLabel, "cm"),
        ctor("rate")
    )

    const skutecnostDelka = deduce(
        deduce(
            deduce(
                cont([lengthLabel], 0.75, planLabel, "dm"),
                ctorUnit("cm")
            ),
            last(meritko(lengthLabel)),
        ),
        ctorUnit("m")
    )

    return {
        sirka: {
            deductionTree: deduce(
                meritko(widthLabel),
                ctorBooleanOption(3_000)
            )
        },
        delka: {
            deductionTree: deduce(
                skutecnostDelka,
                ctorBooleanOption(22, "greater")
            )
        },
        obsah: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        deduce(
                            skutecnostSirka,
                            last(skutecnostDelka),
                            productCombine("obsah", { entity: skutecnostLabel, unit: "m2" })
                        ),
                        ctorUnit("cm2")
                    ),
                    deduce(
                        planSirka,
                        last(planDelka),
                        productCombine("obsah", { entity: planLabel, unit: "cm2" })
                    ),
                    ctor("rate")
                ),
                ctorBooleanOption(90_000)
            )
        }
    }
}
