import { cont, ctor, sum, ctorDifference, contLength, dimensionEntity, evalFormulaAsCont, formulaRegistry, ctorLinearEquation, productCombine, compRelativePercent, ctorQuadraticEquation, doubleProduct, ctorRate, rate, ctorComparePercent, ctorQuota, ctorRound, ctorOption, ratio, ctorPercent, halfProduct } from "../../components/math";
import { createLazyMap, deduce, last, toCont } from "../../utils/deduce-utils";

export default createLazyMap({
    4: () => zahradkar(),
    13: () => ctverec(),
    14.1: () => mzda().a,
    14.2: () => mzda().b,
    21: () => sedyCtverec(),
    22: () => papirovaNadoba(),

})

function zahradkar() {
    const entity = "jahody"
    return {
        deductionTree: deduce(
            compRelativePercent("červenec", "červen", -35),
            compRelativePercent("červen", "květen", 200),
        )
    }
}

function ctverec() {
    const dim = dimensionEntity();
    const a = contLength("AB", "a");
    const DK = contLength("DK", 29)
    const BK = contLength("BK", 1)
    return {
        deductionTree: deduce(
            deduce(
                DK,
                evalFormulaAsCont(formulaRegistry.squareRoot, x => x.y, "čtverec nad přeponou", dim.area)
            ),
            deduce(
                deduce(deduce(
                    a,
                    BK,
                    ctorDifference("AK")
                ), evalFormulaAsCont(formulaRegistry.squareRoot, x => x.y, "čtverec nad AK", dim.area)),
                deduce(a, evalFormulaAsCont(formulaRegistry.squareRoot, x => x.y, "čtverec nad AB", dim.area)),
                sum("čtverce nad odvěsnami")
            ),
            ctorQuadraticEquation("strana", dim.length, "a")
        )
    }
}

function mzda() {
    const entity = "korun"
    const entityOsoba = "zaměstnanci"
    const nastupniMzda = cont("nástupní mzda", "n", entity)
    const prumernaMzda = rate(["průměrná mzda", "původně"], 45_000, entity, entityOsoba)

    const prumerPocet = cont("průměrná mzda", 4, entityOsoba);
    const novePocet = cont("nově", 1, entityOsoba)

    const mzdyPuvodniZamestnanci = deduce(
        prumernaMzda,
        prumerPocet,
    );

    const mzdaNovyZamestnanec = deduce(
        deduce(
            mzdyPuvodniZamestnanci,
            nastupniMzda,
            sum("hodnota celkem")
        ),
        deduce(
            deduce(
                prumernaMzda,
                compRelativePercent("nástupní mzda", "průměrná mzda", -6)
            ),
            deduce(
                prumerPocet,
                novePocet,
                sum("celkem")
            ),
            productCombine("hodnota celkem", entity, [])
        ),
        ctorLinearEquation("nástupní mzda nového zaměstnance", { entity }, "n")
    );
    return {
        a: {
            deductionTree: mzdaNovyZamestnanec,
        },
        b: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        deduce(
                            last(mzdaNovyZamestnanec),
                            ...doubleProduct("mzdy dvou nových zaměstnanců")
                        ),
                        last(mzdyPuvodniZamestnanci),
                        sum("celkem")
                    ),
                    deduce(
                        prumerPocet,
                        cont("nově", 2, entityOsoba),
                        sum("celkem")
                    ),
                    ctorRate(["průměrná mzda", "nově"])
                ),
                prumernaMzda,
                ctorComparePercent()
            )
        }
    }
}

function sedyCtverec() {
    const dim = dimensionEntity();
    const agent = "čtverec";
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    deduce(
                        deduce(contLength(["kruh", "strana"], 1), ...halfProduct("poloměr")),
                        evalFormulaAsCont(formulaRegistry.surfaceArea.circle, x => x.S, ["kruh", "obsah"], dim.area)
                    ),
                    ratio("kruh", "šedá část", 3 / 4)
                ),
                deduce(
                    contLength([agent, "strana"], 1),
                    evalFormulaAsCont(formulaRegistry.surfaceArea.square, x => x.S, [agent, "obsah"], dim.area)
                ),
                ctorPercent()
            ),
            ctorOption("C", 58.9)
        )
    }
}


function papirovaNadoba() {
    const dim = dimensionEntity();
    const plastAgent = 'plášť'
    const polomer = contLength(["podstava", "poloměr"], 3.5);
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    polomer,
                    deduce(
                        deduce(
                            polomer,
                            evalFormulaAsCont(formulaRegistry.circumReference.circle, x => x.o, ["podstava", "obvod"], dim.length)
                        ),
                        cont([plastAgent, "čtverce", "obvod"], 7, "počet"),
                        ctorRate(["válec", "výška"])
                    ),
                    evalFormulaAsCont(formulaRegistry.volume.cylinder, x => x.V, ["válec", "objem"], dim.volume)
                ),
                ctorRound()
            ),
            ctorOption("B", 121)
        )
    }
}