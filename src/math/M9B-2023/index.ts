import { commonSense, compAngle, compRatio, cont, ctor, ctorComplement, ctorDifference, ctorComparePercent, ctorUnit, pythagoras, rate, ratio, sum, product, ctorSlide, double, ctorPercent, ctorOption, compRelative, compRelativePercent, type Container, evalExprAsCont, ctorScaleInvert, ctorBooleanOption, triangleAngle, counter, proportion, productCombine, ctorLinearEquation, comp, ctorScale, ctorComplementCompRatio } from "../../components/math";
import { createLazyMap, deduce, deduceAs, last, lastQuantity, to, toCont, toPredicate } from "../../utils/deduce-utils";

export default createLazyMap({
    2.1: () => lyzarskaPermice().porovnani,
    2.2: () => lyzarskaPermice().triJednodenni,
    6.1: () => expedice().spotreba,
    6.2: () => expedice().velikostExpedice,
    6.3: () => expedice().zasoby,
    7.1: () => cestaDoPrace().rychlik,
    7.2: () => cestaDoPrace().vlak,
    7.3: () => cestaDoPrace().autobus,
    8.1: () => dort().prumerTacu,
    8.2: () => dort().objemDortu,
    14: () => kosikar(),
    15.1: () => procenta().skauti,
    //15.2: () => procenta().kapesne,
    15.3: () => procenta().vstupenky,


})

function expedice() {
    const newState = "nově"
    const currentState = "původně"
    const entity = "dny"
    const dny = cont("dny", 30, entity);
    const osoby = cont("osoby", 12, "osob");
    const osoboDnyEntity = { entity: "spotřeba", unit: "osobodenni" };

    const prvniExpedice = cont("první expedice", "x", "osob");
    return {
        spotreba: {
            deductionTree: deduce(
                deduce(
                    compRatio("nově", "původně", 5 / 6),
                    proportion(false, ["zásoby masa", "počet dní"])
                ),
                cont("původně", 30, entity)
            )
        },
        velikostExpedice: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        cont(newState, 45, entity),
                        cont(currentState, 30, entity),
                        ctor("comp-ratio")
                    ),
                    proportion(true, ["velikost expedice", "počet dní"])
                ),
                cont(currentState, 12, "osob")
            )
        },
        zasoby: {
            deductionTree: deduce(
                deduce(
                    dny,
                    osoby,
                    productCombine("spotreba", osoboDnyEntity)
                ),
                deduce(
                    deduce(
                        prvniExpedice,
                        cont("první expedice", 4, entity),
                        productCombine("první expedice", osoboDnyEntity)
                    ),
                    deduce(
                        deduce(
                            compRatio("druhá expedice", "první expedice", 2),
                            prvniExpedice
                        ),
                        cont("druhá expedice", 8, entity),
                        productCombine("druhá expedice", osoboDnyEntity)
                    ),
                    sum("obě expedice")
                ),
                ctorLinearEquation("první expedice", { entity: "osob" }, "x")
            )
        }
    }
}
function lyzarskaPermice() {

    const entity = "korun"
    const jednodenni = cont("jednodenní", 600, entity)
    const porovnani = compRelativePercent("třídenní", "jednodenní", 150)
    return {
        porovnani: {
            deductionTree: deduce(
                compRelativePercent("třídenní", "jednodenní", 150),
                ctor("convert-percent")
            )
        },
        triJednodenni: {
            deductionTree: deduce(
                deduce(
                    jednodenni,
                    counter("třikrát", 3),
                    product("tři jednodenní")
                ),
                deduce(
                    porovnani,
                    jednodenni
                )
            )
        }

    }
}

function cestaDoPrace() {
    const entity = "doba";
    const unit = "minut";
    const bus = cont("autobus", "x", entity);
    const busVsRychlik = compRatio("autobus", "rychlík", 2);
    const vlakVsBus = compRelative("osobní vlak", "autobus", 1 / 4);

    return {
        rychlik: {
            deductionTree: deduce(
                busVsRychlik,
                bus,
            )
        },
        vlak: {
            deductionTree: deduce(
                vlakVsBus,
                bus
            )
        },
        autobus: {
            deductionTree: deduce(
                deduce(
                    deduce(
                        vlakVsBus,
                        busVsRychlik,
                    ),
                    comp("rychlík", "osobní vlak", -15, { entity, unit })
                ),
                busVsRychlik
            )
        }
    }
}

function dort() {
    const entity = "délka"
    const unit = "cm"
    const entity2d = "obsah"
    const unit2d = "cm2"
    const stranaCtverce = deduce(
        deduce(
            cont("plocha řezu dortu", 200, entity2d, unit2d),
            counter("polovina", 1 / 2),
            ctorScale("čtverec")
        ),
        evalExprAsCont("sqrt(x)", { kind: 'cont', agent: "strana čtverce", entity, unit })
    )
    return {
        prumerTacu: {
            deductionTree: deduce(
                deduce(
                    cont("π * obsah", 144, entity2d, unit2d),
                    evalExprAsCont("sqrt(x)", { kind: 'cont', agent: "poloměr (r)", entity, unit })
                ),
                double(),
                product("průměr")
            )
        },
        objemDortu: {
            deductionTree: deduce(
                deduce(
                    to(
                        stranaCtverce,
                        commonSense("strana čtverce = poloměr dortu"),
                        cont("poloměr dortu", lastQuantity(stranaCtverce), entity, unit)
                    ),
                    evalExprAsCont("π * r^2", { kind: 'cont', agent: "podstava dortu", entity: entity2d, unit: unit2d })
                ),
                to(
                    last(stranaCtverce),
                    commonSense("strana čtverce = výška dortu"),
                    cont("výška dortu", lastQuantity(stranaCtverce), entity, unit)
                ),
                productCombine("dort", { entity: "objem", unit: "cm3" })
            )
        }
    }
}

function kosikar() {
    const entity = "pomlázka"
    return {
        deductionTree: deduce(
            deduce(
                deduce(
                    ratio("prodáno celkem za dva dny", "prodáno 1.den", 1 / 5),
                    ctorComplement("prodáno 2.den")
                ),
                ctorComplementCompRatio("prodáno 1.den")
            ),
            comp("prodáno 2.den", "prodáno 1.den", 180, entity)
        )
    }
}

function procenta() {
    const entity = "členi"
    const letos = cont("letos", 60, entity);
    const vstupenkyEntity = "vstupenky"

    const den2 = cont("2.den", 3, entity);
    const den3 = deduce(
        den2,
        compRelative("3.den", "2.den", 1 / 3)
    )

    return {
        skauti: {
            deductionTree: deduce(
                deduce(
                    letos,
                    deduce(
                        letos,
                        comp("letos", "loni", 20, entity)
                    ),
                    ctorComparePercent()
                ),
                ctorOption("D", 50, { asPercent: true })
            )
        },
        // kapesne: {
        //     deductionTree: deduce(
        //         ratio("kapesné", "utraceno celkem", 3 / 5),
        //         ratio("utraceno celkem", "nákup turistické známky", 3 / 4),
        //     )
        // },
        vstupenky: {
            deductionTree: deduce(
                deduceAs("zvolíme vhodné číslo pro počet členů 1.den, např. 1.den = 3 členi")(
                    den3,
                    deduce(
                        cont("1.den", 3, entity),
                        den2,
                        last(den3),
                        sum("celkem")
                    ),
                    ctorPercent()
                ),
                ctorOption("B", 40, { asPercent: true })
            )
        }
    }

}

