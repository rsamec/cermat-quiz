import { compRatio, cont, ctor, rate, compRelativePercent, comp, contLength, dimensionEntity, ctorUnit, ctorComparePercent, ctorRatios, nthPartFactor, nthPartScale, ctorRate, nthPart, ctorDifference, sum, ctorPercent, ctorOption, lcd, compPercent, ratio, percent, ctorComplement, ctorBooleanOption, ctorExpressionOption, ctorRound, counter, ratios, quota, ctorHasNoRemainder, contAngle, compAngle, contRightAngle, ctorTuple, rightAngleAgent } from "../../components/math";
import { anglesNames, createLazyMap, deduce, deduceAs, last, toCont } from "../../utils/deduce-utils";


export default createLazyMap({
    1: () => trasa(),
    2: () => reproduktory(),
    6.1: () => rychlik().vagon,
    6.2: () => rychlik().mista,
    7.1: () => obedy().cenaB,
    7.2: () => obedy().cenaC,
    8.1: () => kratochvilova().zamestnani,
    8.2: () => kratochvilova().sport,
    11: () => obchod(),
    12: () => knizniSerie(),
    13: () => brambory(),
    // 14: () => uhly(),
    15.1: () => jablka().stejnaMnozstvi,
    15.2: () => jablka().jenLevnejsi,
    15.3: () => jablka().nejviceKilogramu,
    16.1: () => procenta().neznameCislo,
    16.2: () => procenta().zlomky,
    16.3: () => procenta().cerpadla,

})
function uhly() {
    const pravyUhly = contRightAngle();
    const suma = deduce(
        deduce(
            contAngle("zadaný", 126.5),
            compAngle("zadaný", anglesNames.gamma, "supplementary"),
        ),
        deduce(
            pravyUhly,
            compAngle(rightAngleAgent, [anglesNames.alpha, anglesNames.beta].join(" a "), "supplementary")
        ),
        sum("celkem")
    );

    return {
        deductionTree: //deduce(
            deduce(
                deduce(
                    suma,
                    ctor('number-decimal-part')
                ),
                deduce(
                    deduce(
                        last(suma),
                        ctor('number-fraction-part')
                    ),
                    ctorUnit("arcmin")
                ),
                ctor('tuple')
            ),
        //     ctorOption("C", [143, 30])
        // )
    }
}
function trasa() {
    const dim = dimensionEntity();

    const baseEntity = "krok";
    const adam = "Adam"
    const nada = "Naďa"

    const trasaKm = contLength("trasa", 2.7, "km");

    const trasa = deduce(
        trasaKm,
        ctorUnit("cm")
    );

    return {
        deductionTree: deduce(
            toCont(deduce(
                trasa,
                rate(nada, 60, dim.length, baseEntity),
            ), { agent: nada }),
            toCont(deduce(
                rate(adam, 75, dim.length, baseEntity),
                last(trasa)
            ), { agent: adam }),
            ctor("comp")
        )
    }
}

function reproduktory() {
    const puvodne = "původně"
    const novePoSleve1 = "před Vánoci"
    const novePoSleve2 = "po Vánocích"
    const entity = "korun"

    const zlevneni1 = comp(novePoSleve1, puvodne, -150, entity);
    const zlevneni2 = comp(novePoSleve2, novePoSleve1, -200, entity);

    const puvodniCena = deduce(
        compRelativePercent(novePoSleve1, puvodne, -15),
        zlevneni1
    );

    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    puvodniCena,
                    zlevneni1,
                ),
                zlevneni2
            ),
            puvodniCena,
            ctorComparePercent()
        )
    }
}

function rychlik() {
    const trida1 = "1.třída"
    const trida2 = "2.třída"

    const entityBase = "vagón"
    const kupeEntity = "kupé"
    const mistaEntity = "místa k sezení"

    const kupeRate = rate("vlak", 10, kupeEntity, entityBase)
    const trida1Mista = rate(trida1, 6, mistaEntity, kupeEntity)
    const trida2Mista = rate(trida2, 8, mistaEntity, kupeEntity)

    const celkem = cont("vlak", 440, mistaEntity)
    const vagonTrida1 = deduce(
        kupeRate,
        trida1Mista,
        ctorRate(trida1)
    )
    const vagonTrida2 = deduce(
        kupeRate,
        trida2Mista,
        ctorRate(trida1)
    )

    const vlakTrida2 = deduce(
        deduce(
            deduce(
                deduce(
                    compRatio(trida2, trida1, 2),
                    ctorRatios("vlak")
                ),
                vagonTrida1,
                nthPartScale(trida1),
            ),
            vagonTrida2,
            nthPartScale(trida2)
        ),
        celkem,
        nthPart(trida2)
    )

    return {
        vagon: {
            deductionTree: deduce(
                vlakTrida2,
                vagonTrida2
            )
        },
        mista: {
            deductionTree: deduce(
                celkem,
                last(vlakTrida2),
                ctorDifference(`vlak ${trida1}`)
            )
        }

    }
}
function kratochvilova() {
    const den = cont("všechny denní čínnosti", 24, "čas", "h")

    return {
        zamestnani: {
            deductionTree: deduce(
                percent("všechny denní čínnosti", "zaměstnání", 25),
                den
            )
        },
        sport: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        deduce(
                            percent("všechny denní čínnosti", "volný čas", 10),
                            den
                        ),
                        percent("volný čas", "sport", 40)
                    ),
                    ctorUnit("min")
                ),
                ctorRound()
            )
        },
    }
}
function obchod() {
    const entity = "trička"
    const damska = "dámská"
    const panska = "pánská"

    const damskaZCelkem = percent("celkem naskladněno", `${damska} naskladněno`, 60);
    const damskaProdano = cont(`${damska} prodáno`, 45, entity);

    const damskaNaskladneno = deduce(
        ratio(`${damska} naskladněno`, `${damska} prodáno`, 1 / 4),
        damskaProdano
    )

    const celkem = deduce(
        damskaNaskladneno,
        damskaZCelkem
    )

    return {
        deductionTree: deduce(
            deduce(
                celkem,
                deduce(
                    deduce(
                        deduce(
                            last(celkem),
                            deduce(
                                damskaZCelkem,
                                ctorComplement(`${panska} naskladněno`)
                            )
                        ),
                        ratio(`${panska} naskladněno`, `${panska} prodáno`, 1 / 2)
                    ),
                    damskaProdano,
                    sum("celkem prodáno")
                ),
                ctorDifference("neprodáno")
            ),
            ctorExpressionOption("A", "x < 200")
        )
    }
}

function obedy() {
    const entity = "cena"
    const entityBase = "oběd"

    const rateA = deduce(
        cont("A", 4_000, entity),
        cont("A", 20, entityBase),
        ctor("rate")
    )
    const rateB = deduce(
        deduce(
            cont("B", 4_800, entity),
            deduce(
                cont("A", 10, entityBase),
                rateA
            ),
            ctorDifference("B")
        ),
        cont("B", 10, entityBase),
        ctor('rate')
    )
    return {
        cenaB: {
            deductionTree: rateB
        },
        cenaC: {
            deductionTree: deduce(
                deduce(
                    cont("C", 5_400, entity),
                    deduce(
                        deduce(
                            cont("A", 5, entityBase),
                            last(rateA)
                        ),
                        deduce(
                            cont("B", 5, entityBase),
                            last(rateB)
                        ),
                        sum("A a B")
                    ),
                    ctorDifference("C")
                ),
                cont("C", 10, entityBase),
                ctor('rate')
            )
        }
    }
}
function brambory() {
    const agent = "škrabání brambor";
    const entityCas = "čas"
    const hmotnost = { entity: "hmotnost", unit: "kg" }

    const maminkaCas = deduce(
        deduce(
            cont(agent, 2, entityCas, "h"),
            ctorUnit("min")
        ),
        cont(agent, 24, entityCas, "min"),
        sum(agent)
    )
    const babickaCas = deduce(
        deduce(
            cont(agent, 1, entityCas, "h"),
            ctorUnit("min")
        ),
        cont(agent, 20, entityCas, "min"),
        sum(agent)
    )

    const maminka = cont(agent, 6, hmotnost.entity, hmotnost.unit)
    const babicka = cont(agent, 2, hmotnost.entity, hmotnost.unit)

    const maminkaRate = deduce(
        maminkaCas,
        maminka,
        ctorRate("maminka")
    )
    const babickaRate = deduce(
        babickaCas,
        babicka,
        ctorRate("babička")
    )
    const nsn = deduceAs("společný násobek jejich času")(
        maminkaRate,
        babickaRate,
        lcd("dohromady", entityCas, "min")
    )

    return {
        deductionTree: deduce(
            deduce(
                nsn,
                deduce(
                    deduce(
                        last(maminkaRate),
                        toCont(last(nsn), { agent: "maminka" }),
                    ),
                    deduce(
                        last(babickaRate),
                        toCont(last(nsn), { agent: "babička" }),
                    ),
                    sum("dohromady")
                ),
                ctorRate("dohromady")
            ),
            ctorOption("C", 15)
        )
    }
}
function knizniSerie() {
    const entity = "stran"
    const zbyva = cont("zbývá k přečtení", 450, entity)
    return {
        deductionTree: deduce(
            deduce(
                zbyva,
                deduce(
                    cont("přečetl", 1050, entity),
                    zbyva,
                    sum("celkem")
                ),
                ctorPercent()
            ),
            ctorOption("B", 30, { asPercent: true })
        )
    }
}
function jablka() {
    const levnejsiJablka = "levnější jablka"
    const drazsiJablka = "dražší jablka"
    const entity = "korun"
    const entityBase = { entity: "hmotnost", unit: "kg" }

    const nakup1Rozlozeni = ratios("nákup", [levnejsiJablka, drazsiJablka], [1, 1]);
    const nakup1 = cont("nákup", 12, entityBase.entity, entityBase.unit);
    const zaplatila = cont("zaplaceno", 330, entity)
    return {
        stejnaMnozstvi: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        deduce(
                            nakup1,
                            nakup1Rozlozeni,
                            nthPart(levnejsiJablka)
                        ),
                        rate(levnejsiJablka, 25, entity, entityBase)
                    ),
                    deduce(
                        deduce(
                            nakup1,
                            nakup1Rozlozeni,
                            nthPart(drazsiJablka)
                        ),
                        rate(drazsiJablka, 30, entity, entityBase)
                    ),
                    sum("celkem")
                ),
                ctorBooleanOption(330)
            )
        },
        jenLevnejsi: {
            deductionTree: deduce(
                deduce(
                    zaplatila,
                    cont(`skupina po 1 kg ${levnejsiJablka}`, 25, entity),
                    //rate(levnejsiJablka, 25, entity, entityBase),
                    ctor("quota")
                ),
                ctorHasNoRemainder()
            )
        },
        nejviceKilogramu: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        zaplatila,
                        deduce(
                            rate(drazsiJablka, 30, entity, entityBase),
                            cont(drazsiJablka, 1, entityBase.entity, entityBase.unit)
                        ),
                        ctorDifference(`zbytek na ${levnejsiJablka}`)
                    ),
                    cont(`skupina po 1 kg ${levnejsiJablka}`, 25, entity),
                    //rate(levnejsiJablka, 25, entity, entityBase),
                    ctor("quota")
                ),
                ctorHasNoRemainder()
            )
        },

    }
}
function procenta() {
    const entity = { entity: "voda", unit: "litr" }
    const entityBase = { entity: "čas", unit: "h" }

    const cerpadloMensiVykon = "méně výkonné čerpadlo"
    const cerpadloVetsiVykon = "více výkonné čerpadlo"
    return {
        neznameCislo: {
            deductionTree: deduce(
                deduce(
                    compRelativePercent("zvětšené neznámé číslo", "neznámé číslo", 4),
                    counter("zvětšené neznámé číslo", 780)
                ),
                ctorOption("D", 750)
            )
        },
        zlomky: {
            deductionTree: deduce(
                deduce(
                    counter("polovina", 1 / 2),
                    counter("osmina", 1 / 8),
                    ctorComparePercent()
                ),
                ctorOption("A", 300, { asPercent: true, asRelative: true })
            ),
        },
        cerpadla: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        ratios("výkon", [cerpadloMensiVykon, cerpadloVetsiVykon], [3, 7]),
                        rate(cerpadloMensiVykon, 150, entity, entityBase, 2),
                        nthPart(cerpadloVetsiVykon)
                    ),
                    cont(cerpadloVetsiVykon, 5, entityBase.entity, entityBase.unit)
                ),
                ctorOption("E", 875)
            )
        },

    }
}