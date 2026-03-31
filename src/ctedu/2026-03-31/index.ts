import { ctor, ctorOption, sum, ratio, ctorUnit, compRelativePercent, compRelative, contAngle, cont, ctorDifference, ctorLinearEquation, nthPart, compRatio, proportion, percent, ratios, ctorComparePercent, rate, contLength, dimensionEntity, ctorRatios, ctorRate, ctorBooleanOption, evalFormulaAsCont, formulaRegistry, productCombine, contVolume, compAngle } from "../../components/math";
import { createLazyMap, deduce, last, toRate } from "../../utils/deduce-utils";

export default createLazyMap({
    4.1: () => bazen().litry,
    4.2: () => bazen().milimetry,
    6.1: () => finacniMatika().vraceno,
    6.2: () => finacniMatika().urokPoDani,
    6.3: () => finacniMatika().cena,

})

function bazen() {
    const dim = dimensionEntity();
    const obsahDna = deduce(
        contLength("bazén", 4, "m"),
        contLength("bazén", 2.5, "m"),
        evalFormulaAsCont(formulaRegistry.surfaceArea.rectangle, x => x.S, "dno", dimensionEntity("m").area)
    )
    const vyska = contLength("bazén", 2)
    const obsahDnaVCm = deduce(
        obsahDna,
        ctorUnit("cm2")
    );
    const obsahDnaVLitrech = deduce(
        deduce(
            obsahDnaVCm,
            vyska,
            productCombine("bazén", dim.volume)
        ),
        ctorUnit("l")
    )

    return {
        litry: {
            deductionTree: obsahDnaVLitrech
        },
        milimetry: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        last(obsahDnaVLitrech),
                        vyska,
                        ctor("rate")
                    ),
                    contVolume("přibylo", 300, "l")
                ),
                ctorUnit("mm")
            )
        }
    }
}

// function drak(){
//     return {
//         deductionTree: deduce(
//             contAngle("rovnostranný", 60),            
//             compAngle("drak", "")
//         )
//     }
// }


function finacniMatika() {

    const entity = 'Kč'
    const pujckaLabel = "vypůjčená částka"
    const vkladLabel = "vklad"
    const urokLabel = "úrok"
    const srazkovaDan = percent(urokLabel, "daň", 15)

    const pujcka = cont(pujckaLabel, 18_000, entity)
    const vklad = cont(vkladLabel, 800_000, entity)



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
                        percent(pujckaLabel, urokLabel, 12)
                    ),
                    pujcka,
                    sum("vrácená částka")
                ),
                ctorOption("B", 20_160)
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
                    ctorDifference("úrok po odečtení daně")
                ),
                ctorOption("D", 20_400)
            )
        },
        cena: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        cont(["notebook", "na začátku"], 25_000, entity),
                        compRelativePercent("poté", "na začátku", -15)
                    ),
                    compRelativePercent("nově", "poté", 10)
                ),
                ctorOption("F", "jiný výsledek")
            )
        }
    }
}


