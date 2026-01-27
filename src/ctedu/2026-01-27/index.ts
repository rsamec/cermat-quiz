import { cont, ctor, ctorOption, sum, counter, ctorDifference, contLength, dimensionEntity, contArea, ctorUnit, evalFormulaAsCont, formulaRegistry, ctorPercent, ctorComplement, ratio, evalExprAsCont, proportion, ctorSlide, ctorComparePercent, ctorRatios, pythagoras } from "../../components/math";
import { createLazyMap, deduce, last } from "../../utils/deduce-utils";

export default createLazyMap({
    1: () => porovnani(),
    4.1: () => bazen().pocetCerpadel,
    4.2: () => bazen().pomer,
    4.3: () => bazen().pocetHodin,
    5.1: () => krouzkyATridy().rozdil,
    5.2: () => krouzkyATridy().procent,
    5.3: () => krouzkyATridy().pomer,
    6: () => obdelnik(),
    7: () => hranol(),
})

function porovnani() {
    return {
        deductionTree: deduce(
            deduce(
                counter("první zadané číslo", 8),
                evalExprAsCont("x^2", "druhá mocnina", { entity: '' })
            ),
            deduce(
                counter("ratio zadané číslo", 256),
                evalExprAsCont("sqrt(x)", "druhá odmocnina", { entity: '' })
            ),
        )
    }
}
function bazen() {
    const entity = "doba"
    const unit = "h"
    const entityCerpadlo = "čerpadlo"
    const entityBazen = "velikost bazénu"
    const umeraDobaCerpadlo = proportion(true, [entity, entityCerpadlo])
    const umeraDobaBazen = proportion(false, [entity, entityBazen])

    const potrebaEntity = "potřeba";
    return {
        pomer: {
            deductionTree: deduce(
                cont(["nově", "skutečně načerpáno"], 9, entityCerpadlo),
                deduce(
                    deduce(
                        deduce(
                            cont(["původně"], 8, entityCerpadlo),
                            cont(["nově"], 16, entityCerpadlo),
                            ctor("comp-ratio")
                        ),
                        umeraDobaCerpadlo
                    ),
                    cont(["původně", potrebaEntity], 36, entity, unit),
                ),
                ctorPercent()
            )
        },
        pocetCerpadel: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        cont("původně", 36, entity, unit),
                        cont("nově", 24, entity, unit),
                        ctor("comp-ratio")
                    ),
                    umeraDobaCerpadlo
                ),
                cont("původně", 8, entityCerpadlo),
            )
        },
        pocetHodin: {
            deductionTree: deduce(
                cont("začátek napouštění", 8, entity, unit),
                deduce(
                    deduce(
                        deduce(
                            deduce(
                                cont(["původně"], 8, entityCerpadlo),
                                cont(["nově"], 24, entityCerpadlo),
                                ctor("comp-ratio")
                            ),
                            umeraDobaCerpadlo
                        ),
                        cont(["původně", "celý bazén"], 36, entity, unit),
                    ),
                    deduce(
                        ratio('celý bazén', 'napuštěno deštěm', 1 / 3),
                        ctorComplement("zbytek bazénu")
                    )
                ),
                ctorSlide("bazén zcela napuštěn")
            )
        }
    }
}

function krouzkyATridy() {
    const entity = "žák";
    const entityBase = "jednotka grafu"

    const hudebniLabel = "hudební";
    const sachovyLabel = "šachový";
    const robotickyLabel = "robotický";

    const hudebni8 = cont(`${hudebniLabel} 8.`, 5, entityBase);
    const hudebni9 = cont(`${hudebniLabel} 9.`, 4, entityBase);

    const sachovy8 = cont(`${sachovyLabel} 8.`, 4, entityBase);
    const sachovy9 = cont(`${sachovyLabel} 9.`, 7, entityBase);

    const roboticky8 = cont(`${robotickyLabel} 8.`, 3, entityBase);
    const roboticky9 = cont(`${robotickyLabel} 9.`, 8, entityBase);

    const jednotka = deduce(
        cont("rozdíl 9. a 8.", 14, entity),
        deduce(
            deduce(
                hudebni9,
                sachovy9,
                roboticky9,
                sum("9.")
            ),
            deduce(
                hudebni8,
                sachovy8,
                roboticky8,
                sum("8.")
            ),
            ctorDifference("rozdíl 9. a 8.")
        ),
        ctor("rate")
    );
    return {
        rozdil: {
            deductionTree: deduce(
                jednotka,
                deduce(sachovy9, sachovy8, ctorDifference(sachovyLabel))
            )
        },
        procent: {
            deductionTree: deduce(
                hudebni8,
                hudebni9,
                ctorComparePercent()
            )
        },
        pomer: {
            deductionTree: deduce(
                roboticky8,
                roboticky9,
                ctorRatios(robotickyLabel)
            )
        }
    }
}

function obdelnik() {
    const dim = dimensionEntity();
    const kratsi = contLength("kratší strana", 9)
    const delsi = deduce(
        contArea("obdélník ABCD", 108),
        kratsi,
        evalFormulaAsCont(formulaRegistry.surfaceArea.rectangle, x => x.b, "delší strana", dim.length)
    )
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    delsi,
                    kratsi,
                    pythagoras("úhlopříčka", ["kratší strana", "delší strana"])
                ),
                delsi
            ),
            ctorOption("C", 3)
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
                    contLength(["válec", "výška"], 10),
                    deduce(
                        contLength(["válec", "poloměr"], 1, "dm"),
                        ctorUnit("cm")
                    ),
                    evalFormulaAsCont(formulaRegistry.volume.cylinder, x => x.V, "válec", dim.volume)
                ),
                deduce(
                    strana,
                    last(strana),
                    contLength(["hranol", "výška"], 10),
                    evalFormulaAsCont(formulaRegistry.volume.cuboid, x => x.V, "hranol", dim.volume)
                ),
                ctorDifference("rozdíl")
            ),
            ctorOption("A", 2_890)
        )
    }
}
