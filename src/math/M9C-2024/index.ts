import { compRatio, cont, ctor, ctorDifference, sum, compRelative, comp, ctorOption, contLength, halfProduct, pythagoras, proportion, percent, dimensionEntity, evalExprAsCont, triangleAngle, contArea, ratio, ctorUnit, ctorRound, ctorBooleanOption, ctorComplement, nthPart, ctorPercent, productArea, simplifyExpr, evalFormulaAsCont, formulaRegistry } from "../../components/math";
import { createLazyMap, deduce, deduceAs, last, toPredicate } from "../../utils/deduce-utils";
import pocetObyvatel from "./pocet-obyvatel";
import sourozenci from "./sourozenci";


export default createLazyMap({
    1: () => pocetObyvatel({ input: { celkem: 86_200, jihlavaPlus: 16_000 } }),
    2: () => nadoby(),
    6.1: () => lichobeznik().vyska,
    6.2: () => lichobeznik().obsah,
    7.1: () => zahon().obvodKruhoveho,
    7.2: () => zahon().polomerCtvrtkruhovy,
    11: () => krychle(),
    12: () => sourozenci({ input: { evaPodil: 40, michalPlus: 24, zbyvaNasporit: 72 } }),
    13: () => divadlo(),
    14: () => triKamaradi(),
    15.1: () => pruzkum().umelecka,
    15.2: () => pruzkum().devataTrida,
    15.3: () => pruzkum().rovnost,
    16.1: () => zednici().pocetDnu,
    16.2: () => zednici().pocetZedniku,
    16.3: () => zednici().pocetDnuPolovinaStavby,

})

function nadoby() {
    const dim = dimensionEntity();
    const vyskaA = cont("nádoba A", 20, "výška", dim.length.unit)
    const vyskaB = cont("nádoba B", 20, "výška", dim.length.unit)
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    deduce(
                        deduce(
                            contLength("průměr nádoba B", 20),
                            ...halfProduct("poloměr nádoba B")
                        ),
                        vyskaB,
                        evalFormulaAsCont(formulaRegistry.volume.cylinder, x => x.V, "nádoba B", dim.volume)
                    ),
                    deduce(
                        deduce(
                            contLength("průměr nádoba A", 10),
                            ...halfProduct("poloměr nádoba A")
                        ),
                        vyskaA,
                        evalFormulaAsCont(formulaRegistry.volume.cylinder, x => x.V, "nádoba A", dim.volume)
                    ),
                    ctor('comp-ratio')
                ),
                proportion(true, ["zaplnění objemu nádoby", "dosažená výška v nádobě"])
            ),
            vyskaA
        )
    }
}

function lichobeznik() {
    const dim = dimensionEntity()
    const triangleABC = "trojúhleník ABC"
    const triangleACD = "trojúhleník ACD"
    const lichobeznik = "lichoběžník ABCD"

    const obsahABC = contArea(triangleABC, 64);

    const vyska = deduce(
        obsahABC,
        contLength(`stran AB ${triangleABC}`, 16),
        evalFormulaAsCont(formulaRegistry.surfaceArea.triangle, x => x.h, `výška ${lichobeznik}`, dim.length)
    )
    return {
        vyska: {
            deductionTree: vyska,
        },
        obsah: {
            deductionTree: deduce(
                deduce(
                    contLength(`strana CD ${triangleACD}`, 6),
                    last(vyska),
                    evalFormulaAsCont(formulaRegistry.surfaceArea.triangle, x => x.S, triangleACD, dim.area)
                ),
                obsahABC,
                sum(`celkem ${lichobeznik}`)
            )
        }
    }
}

function zahon() {
    const dim = dimensionEntity()
    return {
        obvodKruhoveho: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        deduce(
                            contArea("kruhový záhon", 314, "dm2"),
                            evalFormulaAsCont(formulaRegistry.surfaceArea.circle, x => x.r, "poloměr", { entity: dim.length.entity, unit: "dm" })
                        ),
                        evalFormulaAsCont(formulaRegistry.circumReference.circle, x => x.o, "obvod", { entity: dim.length.entity, unit: "dm" })
                    ),
                    ctorUnit("m")
                ),
                ctorRound()
            )
        },
        polomerCtvrtkruhovy: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        contArea("čtvrtkruh", 314, "dm2"),
                        ratio("celý kruh", "čtvrtkruh", 1 / 4)
                    ),
                    evalFormulaAsCont(formulaRegistry.surfaceArea.circle, x => x.r, "poloměr", { entity: dim.length.entity, unit: "dm" })
                ),
                ctorUnit("m")
            )
        }
    }
}
function divadlo() {
    const pocetMista = "míst"

    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    percent("divadlo", "obsazenost nově", 75),
                    percent("divadlo", "obsazenost původně", 70),
                    ctorDifference("změna obsazenosti")
                ),
                cont("změna obsazenosti", 11, pocetMista)
            ),
            ctorOption("D", 220)
        )
    }
}

function triKamaradi() {
    const entity = "komiks"
    const petrVsCyril = comp("Petr", "Cyril", 3, entity)
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    petrVsCyril,
                    deduce(
                        compRatio("Petr", "Honza", 1),
                        compRelative("Honza", "Cyril", 1 / 8),
                    )
                ),
                petrVsCyril
            ),
            ctorOption("E", 27)
        )
    }
}

function zednici() {
    const dnyEntity = "dny"
    const pocetZednikuEntity = "zedníci"

    const pocetZednikuPuvodne = cont("práce původně", 10, pocetZednikuEntity);
    const pocetZednikuNove = cont("práce nově", 4, pocetZednikuEntity);
    const dnyPuvodne = cont("práce původně", 20, dnyEntity);
    const dnyNove = cont("práce nově", 5, dnyEntity);

    const indirect = proportion(true, [pocetZednikuEntity, dnyEntity])
    return {
        pocetDnu: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        deduce(
                            pocetZednikuNove,
                            pocetZednikuPuvodne,
                            ctor('comp-ratio')
                        ),
                        indirect
                    ),
                    dnyPuvodne
                ),
                ctorOption("E", 50)
            )
        },
        pocetZedniku: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        deduce(
                            dnyNove,
                            dnyPuvodne,
                            ctor('comp-ratio')
                        ),
                        indirect,
                    ),
                    pocetZednikuPuvodne
                ),
                ctorOption("D", 40)
            )
        },
        pocetDnuPolovinaStavby: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        deduce(
                            cont("práce nově", 8, pocetZednikuEntity),
                            pocetZednikuPuvodne,
                            ctor('comp-ratio')
                        ),
                        indirect
                    ),
                    deduceAs("polovina stavby odpovídá polovině práce původně")(
                        dnyPuvodne,
                        ...halfProduct("práce původně")
                    )
                ),
                ctorOption("B", 12.5)
            )
        },

    }
}

function krychle() {
    const dim = dimensionEntity();
    const celaStrana = contLength("strana krychle", 3, "dm")
    const entity = { entity: dim.area.entity, unit: "dm2" }
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    deduce(
                        celaStrana,
                        evalExprAsCont("1/2*a^2 + a^2", "horní plochy", entity)
                    ),
                    deduce(
                        celaStrana,
                        evalExprAsCont("1/2*a^2 + a^2", "dolní plochy", entity)
                    ),
                    deduce(
                        celaStrana,
                        evalExprAsCont("a^2 + 1/2*a^2 +  1/2*a^2", "boční plochy", entity)
                    ),
                    deduce(
                        celaStrana,
                        evalExprAsCont("1/2*a^2 +  1/2*a^2", "přední plochy", entity)
                    ),
                    deduce(
                        celaStrana,
                        evalExprAsCont("1/2*a^2 +  1/2*a^2", "zadní plochy", entity)
                    ),
                    sum("nové těleso")
                ),
                deduce(
                    celaStrana,
                    evalFormulaAsCont(formulaRegistry.surfaceArea.cube, x => x.S, "krychle", entity)
                ),
            ),
            ctorOption("B", 9)
        )
    }
}

function pruzkum() {
    const entityPercent = "%"
    const entity = "žák"

    const whole = "všichni žáci"

    const umeleckeZaci = cont("umělecké", 3, entity)
    const gymZaci = cont("GYM", 12, entity)

    const vsichniZaci = deduce(
        deduce(
            toPredicate<any>(deduce(
                cont("SOŠ", 60, entityPercent),
                cont("SOU", 16, entityPercent),
                sum("dohromady SOŠ a SOU")
            ), d => percent(whole, "dohromady SOŠ a SOU", d.quantity)),
            ctorComplement("GYM")
        ),
        gymZaci
    )

    return {
        umelecka: {
            deductionTree: deduce(
                deduce(
                    umeleckeZaci,
                    vsichniZaci,
                    ctorPercent()
                ),
                ctorBooleanOption(6, "closeTo", { asPercent: true })
            )
        },
        devataTrida: {
            deductionTree: deduce(
                last(vsichniZaci),
                ctorBooleanOption(50, "greater")
            )
        },
        rovnost: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        deduce(
                            last(vsichniZaci),
                            percent(whole, "SOŠ", 60)
                        ),
                        deduce(
                            umeleckeZaci,
                            cont("technické", 15, entity),
                            sum("dohromady umělecké a technické")
                        ),
                        ctorDifference("humanitní")
                    ),
                    gymZaci,
                ),
                ctorBooleanOption(0, "closeTo")
            )
        }
    }
}