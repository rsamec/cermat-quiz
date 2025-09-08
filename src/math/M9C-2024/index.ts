import { commonSense, compRatio, cont, ctor, ctorDifference, rate, sum, ctorSlide, compRelative, compRelativePercent, triangularNumbersPattern, nthPart, comp, ratios, counter, ctorRatios, nthPartFactor, ctorOption, ctorBooleanOption, ctorExpressionOption, contLength, halfProduct, doubleProduct, dimensionEntity, productVolume, pythagoras, productArea, double, half, product, proportion, percent } from "../../components/math";
import { createLazyMap, deduce, deduceAs, last, lastQuantity, to } from "../../utils/deduce-utils";
import pocetObyvatel from "./pocet-obyvatel";
import sourozenci from "./sourozenci";


export default createLazyMap({
    1: () => pocetObyvatel({ input: { celkem: 86_200, jihlavaPlus: 16_000 } }),
    12: () => sourozenci({ input: { evaPodil: 40, michalPlus: 24, zbyvaNasporit: 72 } }),
    13: () => divadlo(),
    14: () => triKamaradi(),
    16.1: () => zednici().pocetDnu,
    16.2: () => zednici().pocetZedniku,
    16.3: () => zednici().pocetDnuPolovinaStavby,

})

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
function zavazi() {
    const delkaL = "délka"
    const sirkaL = "šířka"

    const delka = contLength(delkaL, 8);
    const sirka = contLength(sirkaL, 6);
    //const vyska = contLength("výška", 10);
    return {
        deductionTree: deduce(
            delka,
            sirka,
            deduce(
                deduce(
                    delka,
                    sirka,
                    pythagoras("odvěsna", [delkaL, sirkaL]),
                ),
                ...halfProduct("poloměr")
            ),
            sum("celkem")
        )
    }
}
