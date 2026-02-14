import { cont, ctor, ctorOption, sum, counter, ctorDifference, contLength, dimensionEntity, evalFormulaAsCont, formulaRegistry, ctorPercent, ctorComplement, ratio, evalExprAsCont, proportion, ctorComparePercent, ctorRatios, pythagoras, rate, compDiff, ctorLinearEquation, productCombine, percent, halfProduct, ctorBooleanOption, comp, contAngle, compAngle, commonSense, contRightAngle, triangleAngle, ratios, ctorScale, double, ctorSlide, nthPart } from "../../components/math";
import { anglesNames, createLazyMap, deduce, deduceAs, last, to } from "../../utils/deduce-utils";

export default createLazyMap({
    1: () => vypocet(),
    6.1: () => houskyARohliky().triRohliky,
    6.2: () => houskyARohliky().rohlik,
    6.3: () => houskyARohliky().cenaHousky,
    7.1: () => automat().doba,
    7.2: () => automat().pomer,
    7.3: () => automat().pocetHodin,
    11.1: () => cykloTrasy().a,
    11.2: () => cykloTrasy().b,
    11.3: () => cykloTrasy().c,
    12: () => hranol(),
    13: () => obdelnik(),
    14: () => uhelAlfa(),
    15.1: () => procenta().prvni,
    15.2: () => procenta().druha,
    15.3: () => procenta().treti,
    16.1: () => trojuhelnik().a,
    16.2: () => trojuhelnik().b,
    16.3: () => trojuhelnik().c,

})

function vypocet() {
    return {
        deductionTree: deduce(
            deduce(
                counter("první prvočíslo", 2),
                counter("druhé prvočíslo", 3),
                counter("třetí prvočíslo", 5),
                sum("součet")
            ),
            evalExprAsCont("x^2", "mocnina součtu", { entity: "" })
        )
    }
}

function houskyARohliky() {
    const houskaLabel = "houska"
    const rohlikLabel = "rohlík"
    const entity = "kus"
    const cena = "korun"

    const houskaRate = rate(houskaLabel, "h", cena, entity)
    const triRohliky = deduce(
        deduce(
            houskaRate,
            cont(houskaLabel, 2, entity),
        ),
        compDiff(houskaLabel, rohlikLabel, 6, cena)
    );
    const rohlikRate = deduce(
        last(triRohliky),
        cont(rohlikLabel, 3, entity),
        ctor('rate')
    )
    return {
        rohlik: {
            deductionTree: rohlikRate
        },
        triRohliky: {
            deductionTree: triRohliky
        },
        cenaHousky: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        cont(["Klára", houskaLabel], 6, entity),
                        houskaRate
                    ),
                    deduce(
                        cont(["Klára", rohlikLabel], 6, entity),
                        last(rohlikRate)
                    ),
                    sum("Klára zaplaceno")
                ),
                cont("Klára zaplaceno", 78, cena),
                ctorLinearEquation(houskaLabel, { entity: cena }, "h")
            )
        },
    }
}

function automat() {
    const entity = "doba"
    const unit = "h"
    const entityAutomat = "automat"
    const umeraDobaAutomat = proportion(true, [entity, entityAutomat])


    const zakazka = "celá zakázka"

    const dobaNoveZakazky = (noveAutomat, targetAgent) => deduce(
        deduce(
            deduce(
                cont(["hypoteticky"], 12, entityAutomat),
                cont(["nově"], noveAutomat, entityAutomat),
                ctor("comp-ratio")
            ),
            umeraDobaAutomat
        ),
        cont(targetAgent, 60, entity, unit),
    )

    const prvniCastZakazky = ratio(zakazka, 'první část', 1 / 4);

    const potrebaEntity = "potřeba";
    return {
        pomer: {
            deductionTree: deduce(
                cont(["nově", "skutečně"], 24, entity),
                dobaNoveZakazky(5, ["hypoteticky", potrebaEntity]),
                ctor("ratio")
            )
        },
        doba: {
            deductionTree: dobaNoveZakazky(20, ["hypoteticky"])
        },
        pocetHodin: {
            deductionTree: deduce(

                deduce(
                    dobaNoveZakazky(15, ["hypoteticky", zakazka]),
                    prvniCastZakazky,
                ),
                deduce(
                    dobaNoveZakazky(18, ["hypoteticky", zakazka]),
                    deduce(
                        prvniCastZakazky,
                        ctorComplement("zbytek")
                    ),
                ),
                sum("celkem")
            )
        }
    }
}

function cykloTrasy() {
    const entity = "vzdálenost"
    const unit = "km"

    const enitityDil = "dílek"

    const adamCelkem = cont("Adam", 3 + 6, enitityDil);
    const benCelkem = cont("Ben", 8 + 4, enitityDil);
    const cyriCelkem = cont("Cyril", 5 + 10, enitityDil);

    return {
        a: {
            deductionTree: deduce(
                adamCelkem,
                benCelkem,
                cyriCelkem,
                ctorRatios("poměr", { useBase: true })
            ),
        },
        b: {
            deductionTree: deduce(
                deduce(
                    cont("Cyril", 10, enitityDil),
                    cont("Adam", 6, enitityDil),
                    ctorComparePercent(),
                ),
                ctorBooleanOption(40, "closeTo", { asPercent: true })
            )
        },
        c: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        deduce(
                            adamCelkem,
                            benCelkem,
                        ),
                        comp("Adam", "Ben", -45, { entity, unit }),
                    ),
                    cont("Ben", 8, enitityDil)
                ),
                ctorBooleanOption(100, "smaller")
            )
        }
    }
}


function obdelnik() {
    const dim = dimensionEntity();
    const delsi = contLength("strana AC", 16)
    const prepona = contLength("přepona AB", 20)
    const kratsi = deduce(
        delsi,
        prepona,
        pythagoras("přepona AB", ["strana BC", "strana AC"])
    )
    return {
        deductionTree: deduce(
            deduce(
                kratsi,
                delsi,
                evalFormulaAsCont(formulaRegistry.surfaceArea.triangle, x => x.S, "trojúhelník ABC", dim.area)
            ),
            ctorOption("A", 96)
        )

    }
}


function hranol() {
    const dim = dimensionEntity()
    const strana = deduce(
        contLength(["hranol", "obvod"], 20),
        evalFormulaAsCont(formulaRegistry.circumReference.square, x => x.a, "strana", dim.length)
    );
    return {
        deductionTree: deduce(
            deduce(

                deduce(
                    contLength(["hranol", "strana"], 2),
                    contLength(["hranol", "strana"], 2),
                    contLength(["hranol", "výška"], 4),
                    evalFormulaAsCont(formulaRegistry.volume.cuboid, x => x.V, "hranol", dim.volume)
                ),
                deduce(
                    deduce(
                        contLength(["válec", "poloměr"], 1),
                        contLength(["válec", "výška"], 4),
                        evalFormulaAsCont(formulaRegistry.volume.cylinder, x => x.V, "válec", dim.volume)
                    ),
                    ...halfProduct("polovina válce")
                ),
                ctorDifference("těleso s prohlubní")
            ),
            ctorOption("B", 9.72)
        )
    }
}

function uhelAlfa() {
    const csx = contAngle("CSX", 20)
    return {
        deductionTree: deduce(
            deduce(
                deduceAs("Využití vlastností úhlopříček kosočtverce")(
                    contRightAngle("BSC"),
                    deduceAs("Vlastnost těžnice v pravoúhlém trojúhelníku, resp. trojúhelník CSX je rovnoramenný s rameny SX and CX")(
                        csx,
                        compAngle("CSX", "SCX", "isosceles-triangle-at-the-base")
                    ),
                    triangleAngle("CBS")
                ),
                compAngle("CBS", anglesNames.phi, "alternate-interior")
            ),
            ctorOption("E", 70)
        )
    }
}

function trojuhelnik() {
    const dim = dimensionEntity();
    const rozdilDelekLabel = "rozdíl délek odvěsen"
    const kratsiLabel = "kratší strana"
    const delsiLabel = "delší strana"
    const agent = "trojúhelník"
    const entityBase = "krok"
    const kratsi = contLength(kratsiLabel, 5)
    const delsi = contLength(delsiLabel, 12)
    const vychoziRozdilDelek = deduce(delsi, kratsi, ctorDifference("výchozí rozdíl délek odvěsen"))
    const delsiStranaRate = rate(delsiLabel, 2, dim.length, entityBase)
    const kratsiStranaRate = rate(kratsiLabel, 5, dim.length, entityBase, 6)
    const rateRozdilDelek = rate(rozdilDelekLabel, 7, dim.length, entityBase, 6)
    const pomerStran = deduce(kratsi, delsi, ctorRatios(agent))
    return {
        a: {
            deductionTree: deduce(
                deduce(
                    contLength(rozdilDelekLabel, 14),
                    vychoziRozdilDelek,
                    ctorDifference(rozdilDelekLabel)
                ),
                rateRozdilDelek
            ),
        },
        b: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        cont(delsiLabel, 60, entityBase),
                        delsiStranaRate
                    ),
                    contLength(`výchozí ${delsiLabel}`, 12),
                    ctor("slide")
                ),
                pomerStran,
                nthPart(kratsiLabel)
            ),
        },
        c: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        contLength(kratsiLabel, 300),
                        contLength(`výchozí ${kratsiLabel}`, 5),
                        ctor("slide-invert")
                    ),
                    kratsiStranaRate
                ),
                cont("posun o", 1, entityBase),
                ctor('slide-invert')
            )
        }


    }
}

function procenta() {
    const entityCena = "cena"
    const unit = "Kč"
    const entityKusy = "kus"

    const tabor = cont("tábor", 2_400, entityCena, unit)
    const syrMensiBaleniLabel = 'menší balení'
    const syrVetsiBaleniLabel = 'větší balení'

    const lodeEntity = "loď"
    const dnyEntity = "den"
    const lodeDnyEntity = "lodPerDen"

    const lyze = "lyže"
    const modelLoniLabel = "loňský model"
    const modelLetosLabel = "letošní model"
    const nasetrenoLabel = "našetřeno"
    const modelLoni = cont(modelLoniLabel, 10_000, entityCena, unit)
    const nasetreno = deduce(
        percent(modelLoniLabel, nasetrenoLabel, 92),
        modelLoni
    )
    return {
        prvni: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        cont(syrVetsiBaleniLabel, 123, entityCena, unit),
                        cont(syrVetsiBaleniLabel, 3, entityKusy),
                        ctor('rate')
                    ),
                    deduce(
                        cont(syrMensiBaleniLabel, 100, entityCena, unit),
                        cont(syrMensiBaleniLabel, 2, entityKusy),
                        ctor('rate')
                    ),
                    ctorComparePercent()
                ),
                ctorOption("D", 18, { asPercent: true })
            )
        },
        druha: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        cont("vybrané peníze", 2, lodeEntity),
                        cont("vybrané peníze", 4, dnyEntity),
                        productCombine("vybrané peníze", lodeDnyEntity)
                    ),
                    deduce(
                        cont("vybrané peníze", 10, lodeEntity),
                        cont("vybrané peníze", 5, dnyEntity),
                        productCombine("vybrané peníze", lodeDnyEntity)
                    ),
                    ctorPercent()
                ),
                ctorOption("C", 16, { asPercent: true })
            )
        },
        treti: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        nasetreno,
                        percent(modelLetosLabel, nasetrenoLabel, 80)
                    ),
                    modelLoni,
                    ctorComparePercent()
                ),
                ctorOption("B", 15, { asPercent: true })
            )
        }
    }
}
